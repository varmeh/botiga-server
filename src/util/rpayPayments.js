/* eslint-disable max-lines-per-function */
import axios from 'axios'
import CreateHttpError from 'http-errors'
import Razorpay from 'razorpay'

import { Order, PaymentStatus, User } from '../models'
import { winston } from './winston.logger'
import aws from './aws'

const TEST_TRANSACTION = 'testTransaction'

const MDR_CHARGES = 0.12 / 100 // represents 0.12 %

const { RPAY_HOST, RPAY_ID, RPAY_SECRET, RPAY_WEBHOOK_SECRET } = process.env

const authToken = Buffer.from(`${RPAY_ID}:${RPAY_SECRET}`, 'utf8').toString(
	'base64'
)

const routeTransaction = async ({
	txnAmount,
	sellerMid,
	orderId = TEST_TRANSACTION
}) => {
	try {
		const payload = {
			amount: txnAmount * 100,
			currency: 'INR',
			notes: { orderId }
		}

		if (process.env.NODE_ENV === 'production') {
			// add routing logic
			const mdrCharges = txnAmount * MDR_CHARGES
			const amountToBeTransfered = txnAmount - mdrCharges
			payload.transfers = [
				{
					account: sellerMid,
					amount: Math.ceil(amountToBeTransfered * 100),
					currency: 'INR'
				}
			]
		}

		const { data } = await axios.post(`${RPAY_HOST}/orders`, payload, {
			headers: {
				Authorization: `Basic ${authToken}`
			}
		})
		return data
	} catch (error) {
		winston.debug('@payment routeTransaction failed', {
			error,
			msg: error.message
		})
		return Promise.reject(
			new Error('Payment Gateway down. Please try after some time')
		)
	}
}

const initiateTransaction = async ({ txnAmount, orderId }) => {
	try {
		const order = await Order.findById(orderId)

		const data = await routeTransaction({
			txnAmount,
			sellerMid: order.seller.accountId,
			orderId: orderId
		})

		// Save razorpay orderId for future reference
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

const webhook = async (data, signature) => {
	// Validate Webhook data
	if (
		!Razorpay.validateWebhookSignature(
			JSON.stringify(data),
			signature,
			RPAY_WEBHOOK_SECRET
		)
	) {
		// Webhook validation failure
		winston.error('@payment webhook validation failed', {
			domain: 'webhook',
			data: JSON.stringify(data),
			signature
		})
		return Promise.reject(
			new CreateHttpError[500]('Webhook Validation Failure')
		)
	}

	const {
		event,
		payload: {
			payment: { entity }
		}
	} = data

	try {
		if (!entity.notes.orderId || entity.notes.orderId === TEST_TRANSACTION) {
			winston.info('@payment webhook test transaction', {
				domain: 'webhook',
				event,
				paymentId: entity.id
			})
			return null
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

		// Send seller email in case of failure
		if (event === 'payment.failed') {
			await aws.ses.sendMailPromise({
				from: 'noreply@botiga.app',
				to: order.seller.email,
				subject: `Botiga - Payment Failed for Order #${order.order.number} - ${order.apartment.aptName} `,
				text: `Order Details
				<br>Please remind the customer to make the payment via Remind option in your order detail screen.
				<br>Confirm the order before delivering. If users confirms the order, ask him to retry payment.
				<br><br>Thank you
				<br>Team Botiga`
			})
		}
		return null
	} catch (error) {
		winston.debug('@payment webhook failed', {
			domain: 'webhook',
			error,
			errorMessage: error.message,
			paymentId: entity.id,
			event,
			entity
		})
		return winston.error('@payment webhook failed', {
			paymentId: entity.id,
			event
		})
	}
}

export default {
	routeTransaction,
	initiateTransaction,
	webhook
}
