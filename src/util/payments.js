import axios from 'axios'
import paytmChecksum from 'paytmchecksum'
import { winston } from './winston.logger'

const { PAYTM_HOST, PAYTM_MID, PAYTM_KEY, PAYTM_WEBSITE } = process.env

/**
 * Returns txnToken
 */
const initiateTransaction = async ({ txnAmount, orderNumber, customerId }) => {
	try {
		const paytmData = {
			body: {
				requestType: 'Payment',
				mid: PAYTM_MID,
				orderId: orderNumber,
				websiteName: PAYTM_WEBSITE,
				callbackUrl:
					'https://dev.botiga.app/api/user/orders/transaction/callback',
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
			`${PAYTM_HOST}/theia/api/v1/initiateTransaction?mid=${PAYTM_MID}&orderId=${orderNumber}`,
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
		return { txnToken: body.txnToken }
	} catch (error) {
		winston.debug('@payment initiate transaction failed', {
			error,
			msg: error.message
		})
		return Promise.reject(new Error(error.message))
	}
}

export default { initiateTransaction }
