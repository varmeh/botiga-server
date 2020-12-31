import axios from 'axios'

import { Order, PaymentStatus } from '../models'
import { winston } from './winston.logger'

const { RPAY_HOST, RPAY_ID, RPAY_SECRET } = process.env

const authToken = Buffer.from(`${RPAY_ID}:${RPAY_SECRET}`, 'utf8').toString(
	'base64'
)

const initiateTransaction = async ({ txnAmount, orderId }) => {
	try {
		// Save payment id for future reference
		const order = await Order.findById(orderId)

		const { data } = await axios.post(
			`${RPAY_HOST}/orders`,
			{
				amount: txnAmount * 100,
				currency: 'INR',
				notes: { orderId: order.id }
			},
			{
				headers: {
					Authorization: `Basic ${authToken}`
				}
			}
		)

		order.payment.status = PaymentStatus.initiated
		order.payment.orderId = data.id
		await order.save()

		return data
	} catch (error) {
		winston.debug('@payment initiate transaction failed', {
			error,
			msg: error.message
		})
		return Promise.reject(new Error(error.message))
	}
}

const webhook = async data => {
	try {
		const {
			event,
			payload: {
				payment: { entity }
			}
		} = data
		const order = await Order.findById(entity.notes.orderId)

		if (event === 'payment.captured') {
			order.payment.status = PaymentStatus.success
		} else if (event === 'payment.failed') {
			order.payment.status = PaymentStatus.failure
		}

		order.payment.paymentId = entity.id
		order.payment.paymentMode = entity.method
		const updatedOrder = await order.save()

		return updatedOrder
	} catch (error) {
		winston.debug('@payment webhook failed', {
			error,
			msg: error.message
		})
		return Promise.reject(new Error(error.message))
	}
}

export default {
	initiateTransaction,
	webhook
}
