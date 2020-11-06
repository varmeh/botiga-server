import axios from 'axios'
import paytmChecksum from 'paytmchecksum'
import { nanoid } from 'nanoid'

import { Order, PaymentStatus } from '../models'
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

const transactionStatus = async ({ paymentId }) => {
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

		// Save payment data into order
		const [orderId] = paymentId.split('_')
		const order = await Order.findById(orderId)

		const { payment } = order
		const {
			txnId,
			bankTxnId,
			gatewayName,
			bankName,
			paymentMode,
			txnDate,
			txnAmount,
			resultInfo: { resultMsg, resultStatus }
		} = body
		payment.txnId = txnId
		payment.txnDate = txnDate
		payment.paymentMode = paymentMode
		payment.bankTxnId = bankTxnId
		payment.gatewayName = gatewayName
		payment.bankName = bankName
		payment.txnResponseMessage = resultMsg
		payment.txnAmount = txnAmount

		if (resultStatus === 'TXN_SUCCESS') {
			payment.status = PaymentStatus.completed
		} else if (resultStatus === 'TXN_FAILURE') {
			payment.status = PaymentStatus.failed
		} else {
			payment.status = PaymentStatus.pending
		}

		await order.save()

		return body
	} catch (error) {
		winston.debug('@payment transaction status failed', {
			error,
			msg: error.message
		})
		return Promise.reject(new Error(error.message))
	}
}

export default { initiateTransaction, transactionStatus }
