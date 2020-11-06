import axios from 'axios'
import paytmChecksum from 'paytmchecksum'
import { nanoid } from 'nanoid'

import { winston } from './winston.logger'

const { PAYTM_HOST, PAYTM_MID, PAYTM_KEY, PAYTM_WEBSITE } = process.env

/**
 * Returns txnToken
 */
const initiateTransaction = async ({
	txnAmount,
	orderId,
	customerId,
	callbackUrl
}) => {
	try {
		// Required to ensure a unique id for payments
		const orderIdRandom = `${orderId}_${nanoid(6)}`

		const paytmData = {
			body: {
				requestType: 'Payment',
				mid: PAYTM_MID,
				orderId: orderIdRandom,
				websiteName: PAYTM_WEBSITE,
				callbackUrl: callbackUrl,
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
			`${PAYTM_HOST}/theia/api/v1/initiateTransaction?mid=${PAYTM_MID}&orderId=${orderIdRandom}`,
			paytmData
		)
		if (body.resultInfo.resultStatus === 'S') {
			// Validate Checksum
			const isVerifySignature = await paytmChecksum.verifySignature(
				JSON.stringify(body),
				PAYTM_KEY,
				head.signature
			)

			if (!isVerifySignature) {
				winston.debug('@paytm checksum mismatched', {
					error: 'paytm might be compromised. Verfiy'
				})
				throw new Error('Paytm Gateway Down. Please try again')
			}
		} else {
			winston.debug('@paytm initiate transaction failed', {
				error: body.resultInfo
			})
			throw new Error('Paytm Gateway Down. Please try again')
		}
		return { paymentToken: body.txnToken, paymentId: orderIdRandom }
	} catch (error) {
		winston.debug('@payment initiate transaction failed', {
			error,
			msg: error.message
		})
		return Promise.reject(new Error(error.message))
	}
}

const transactionStatus = async orderId => {
	try {
		const paytmData = {
			body: {
				requestType: 'Payment',
				mid: PAYTM_MID,
				orderId: orderId,
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

		if (body.resultInfo.resultStatus === 'TXN_SUCCESS') {
			// Validate Checksum
			const isVerifySignature = await paytmChecksum.verifySignature(
				JSON.stringify(body),
				PAYTM_KEY,
				head.signature
			)

			if (!isVerifySignature) {
				winston.debug('@paytm checksum mismatched', {
					error: 'paytm might be compromised. Verfiy'
				})
				throw new Error('Paytm Gateway Down. Please try again')
			}
		} else {
			winston.debug('@paytm transaction status failed', {
				error: body.resultInfo
			})
			throw new Error(body.resultInfo.resultMsg)
		}

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
