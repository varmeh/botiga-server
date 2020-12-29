/* eslint-disable camelcase */
import axios from 'axios'
import { nanoid } from 'nanoid'

import { Order, PaymentStatus } from '../models'
import { winston } from './winston.logger'

const { RPAY_HOST, RPAY_ID, RPAY_SECRET } = process.env

const authToken = Buffer.from(`${RPAY_ID}:${RPAY_SECRET}`, 'utf8').toString(
	'base64'
)

const initiateTransaction = async ({ txnAmount, orderId }) => {
	try {
		const receiptId = `${orderId}_${nanoid(6)}`

		// Save payment id for future reference
		const order = await Order.findById(orderId)
		order.payment.status = PaymentStatus.initiated
		order.payment.paymentId = receiptId
		await order.save()

		const { data } = await axios.post(
			`${RPAY_HOST}/orders`,
			{
				amount: txnAmount,
				currency: 'INR',
				receipt: receiptId
			},
			{
				headers: {
					Authorization: `Basic ${authToken}`
				}
			}
		)
		return data
	} catch (error) {
		winston.debug('@payment initiate transaction failed', {
			error,
			msg: error.message
		})
		return Promise.reject(new Error(error.message))
	}
}

export default {
	initiateTransaction
}
