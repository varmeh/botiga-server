import axios from 'axios'

import { Order, PaymentStatus, User } from '../models'
import { winston } from './winston.logger'

const TEST_TRANSACTION = 'testTransaction'

const { RPAY_HOST, RPAY_ID, RPAY_SECRET } = process.env

const authToken = Buffer.from(`${RPAY_ID}:${RPAY_SECRET}`, 'utf8').toString(
	'base64'
)

const initiateTransaction = async ({ txnAmount, orderId }) => {
	try {
		// Save payment id for future reference
		const order = await Order.findById(orderId)

		const payload = {
			amount: txnAmount * 100,
			currency: 'INR',
			notes: { orderId: orderId ?? TEST_TRANSACTION }
		}

		const { data } = await axios.post(`${RPAY_HOST}/orders`, payload, {
			headers: {
				Authorization: `Basic ${authToken}`
			}
		})

		if (orderId) {
			order.payment.status = PaymentStatus.initiated
			order.payment.orderId = data.id
			await order.save()
		}

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
	const {
		event,
		payload: {
			payment: { entity }
		}
	} = data

	try {
		if (!entity.notes.orderId || entity.notes.orderId === TEST_TRANSACTION) {
			winston.info('@payment webhook test transaction', {
				event,
				entity
			})
			return
		}
		const order = await Order.findById(entity.notes.orderId)

		if (event === 'payment.captured') {
			order.payment.status = PaymentStatus.success
		} else if (event === 'payment.failed') {
			order.payment.status = PaymentStatus.failure
		}

		order.payment.paymentId = entity.id
		order.payment.paymentMode = entity.method
		await order.save()

		const user = await User.findById(order.buyer.id)

		user.sendNotifications(
			'Payment Update',
			`Your payment of ${order.order.totalAmount} for order #${
				order.order.number
			} to ${order.seller.brandName} has ${
				order.payment.status === PaymentStatus.success
					? 'been successful'
					: 'failed. Any amount debited will be credited back to your account.'
			}`
		)
	} catch (error) {
		winston.debug('@payment webhook failed', {
			error,
			msg: error.message,
			paymentId: entity.id,
			event,
			entity
		})
		winston.error('@payment webhook failed', { paymentId: entity.id, event })
	}
}

export default {
	initiateTransaction,
	webhook
}
