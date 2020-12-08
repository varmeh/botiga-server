import axios from 'axios'
import paytmChecksum from 'paytmchecksum'
import { nanoid } from 'nanoid'

import { Order, PaymentStatus, User } from '../models'
import { winston } from './winston.logger'

const {
	PAYTM_HOST,
	PAYTM_MID,
	PAYTM_KEY,
	PAYTM_WEBSITE,
	API_HOST_URL
} = process.env

const verifyCheckSumHelper = async (body, signature) => {
	try {
		const isVerifySignature = await paytmChecksum.verifySignature(
			JSON.stringify(body),
			PAYTM_KEY,
			signature
		)

		if (!isVerifySignature) {
			winston.debug('@paytm checksum mismatched', {
				error: 'paytm might be compromised. Verfiy'
			})
		}
	} catch (error) {
		winston.debug('@paytm checksum verification error')
	}
}

/**
 * Returns txnToken
 */
const initiateTransaction = async ({ txnAmount, orderId, customerId }) => {
	try {
		// Required to ensure a unique id for payments
		const paymentId = `${orderId}_${nanoid(6)}`

		// Save payment id for future reference
		const order = await Order.findById(orderId)
		order.payment.status = PaymentStatus.initiated
		order.payment.paymentId = paymentId
		await order.save()

		const paytmData = {
			body: {
				requestType: 'Payment',
				mid: PAYTM_MID,
				orderId: paymentId,
				websiteName: PAYTM_WEBSITE,
				callbackUrl: `${API_HOST_URL}/api/user/orders/transaction/status?paymentId=${paymentId}`,
				txnAmount: {
					value: txnAmount,
					currency: 'INR'
				},
				userInfo: {
					custId: customerId
				}
			},
			head: { channelId: 'WAP' }
		}
		paytmData.head.signature = await paytmChecksum.generateSignature(
			JSON.stringify(paytmData.body),
			PAYTM_KEY
		)
		const {
			data: { head, body }
		} = await axios.post(
			`${PAYTM_HOST}/theia/api/v1/initiateTransaction?mid=${PAYTM_MID}&orderId=${paymentId}`,
			paytmData
		)

		await verifyCheckSumHelper(body, head.signature)

		if (body.resultInfo.resultStatus === 'S') {
			return { paymentToken: body.txnToken, paymentId: paymentId }
		} else {
			winston.debug('@paytm initiate transaction failed', {
				error: body.resultInfo
			})
			throw new Error('Paytm Gateway Down. Please try again')
		}
	} catch (error) {
		winston.debug('@payment initiate transaction failed', {
			error,
			msg: error.message
		})
		return Promise.reject(new Error(error.message))
	}
}

const getTransactionStatus = async paymentId => {
	try {
		const paytmData = {
			body: {
				requestType: 'Payment',
				mid: PAYTM_MID,
				orderId: paymentId,
				websiteName: PAYTM_WEBSITE
			},
			head: { channelId: 'WAP' }
		}

		paytmData.head.signature = await paytmChecksum.generateSignature(
			JSON.stringify(paytmData.body),
			PAYTM_KEY
		)

		const {
			data: { head, body }
		} = await axios.post(`${PAYTM_HOST}/v3/order/status`, paytmData)

		await verifyCheckSumHelper(body, head.signature)

		return body
	} catch (error) {
		winston.debug('@payment getTransactionStatus failed', {
			error,
			msg: error.message
		})
		return Promise.reject(new Error(error.message))
	}
}

const updateOrderDataInDb = async (paymentId, txnData) => {
	try {
		// Save payment data into order
		const [orderId] = paymentId.split('_')
		const order = await Order.findById(orderId)

		const {
			txnId,
			bankTxnId,
			gatewayName,
			bankName,
			paymentMode,
			txnDate,
			txnAmount,
			resultInfo: { resultMsg, resultStatus }
		} = txnData

		let status = PaymentStatus.pending
		if (resultStatus === 'TXN_SUCCESS') {
			status = PaymentStatus.success
		} else if (resultStatus === 'TXN_FAILURE') {
			status = PaymentStatus.failure
		}

		order.payment = {
			paymentId,
			status,
			txnId,
			txnDate,
			paymentMode,
			gatewayName,
			bankTxnId,
			bankName,
			txnResponseMessage: resultMsg,
			txnAmount
		}

		await order.save()

		return order
	} catch (error) {
		winston.debug('@payment updateOrderDataInDb failed', {
			error,
			msg: error.message
		})
		return Promise.reject(new Error(error.message))
	}
}

const pendingStatusUpdate = async paymentId => {
	try {
		console.error(`payment status update callback for paymentId - ${paymentId}`)
		const data = await getTransactionStatus(paymentId)

		const {
			resultInfo: { resultStatus }
		} = data

		if (resultStatus === 'TXN_SUCCESS' || resultStatus === 'TXN_FAILURE') {
			console.error(`payment status update - ${resultStatus}`)
			const order = await updateOrderDataInDb(paymentId, data)

			console.error('order info: ', order)
			const user = await User.findById(order.buyer.id)

			console.error('user info: ', user)
			user.sendNotifications(
				'Payment Update',
				`Your payment of ${order.totalAmount} for order #${
					order.order.number
				} to ${order.seller.brandName} has ${
					resultStatus === 'TXN_SUCCESS'
						? 'been successful'
						: 'failed. Please try again.'
				}`
			)
		} else {
			setTimeout(() => pendingStatusUpdate(paymentId), 1 * 60 * 1000)
		}
	} catch (error) {
		winston.debug('@payment pendingStatusUpdate failed', {
			error,
			msg: error.message,
			paymentId
		})
		winston.error('@payment pendingStatusUpdate failed', { paymentId })
	}
}

const transactionStatus = async ({ paymentId }) => {
	try {
		const data = await getTransactionStatus(paymentId)

		// Save payment data into order database
		const order = await updateOrderDataInDb(paymentId, data)

		if (order.payment.status === PaymentStatus.pending) {
			// If payment status is pending, check after 5 mins for payment update
			setTimeout(() => pendingStatusUpdate(paymentId), 1 * 60 * 1000)
		}

		return order
	} catch (error) {
		winston.debug('@payment transaction status failed', {
			error,
			msg: error.message
		})
		return Promise.reject(new Error(error.message))
	}
}

export default { initiateTransaction, transactionStatus }
