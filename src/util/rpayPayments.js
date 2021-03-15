/* eslint-disable max-statements */
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
		winston.error('@payment routeTransaction failed', {
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
		winston.error('@payment initiate transaction failed', {
			error,
			msg: error.message
		})
		return Promise.reject(new Error(error.message))
	}
}

const webhookSignatureVerification = (data, signature) => {
	if (
		!Razorpay.validateWebhookSignature(
			JSON.stringify(data),
			signature,
			RPAY_WEBHOOK_SECRET
		)
	) {
		// Webhook validation failure
		winston.error('@rpay webhook validation failed', {
			domain: 'webhook',
			data,
			signature
		})
		throw new Error('Webhook Validation Failure')
	}
}

const paymentWebhook = async (data, signature) => {
	try {
		webhookSignatureVerification(data, signature)

		const {
			event,
			payload: {
				payment: { entity }
			}
		} = data

		if (!entity.notes.orderId || entity.notes.orderId === TEST_TRANSACTION) {
			winston.info('@payment webhook test transaction', {
				domain: 'webhook',
				event,
				paymentId: entity.id
			})
			return null
		}
		const order = await Order.findById(entity.notes.orderId)

		// Check if payment status is already success
		// As webhooks could be received in any order, failure webhooks could override success webhooks which is never the case in execution
		if (order.payment.status === PaymentStatus.success) {
			return null
		}

		if (event === 'payment.captured') {
			order.payment.status = PaymentStatus.success
		} else if (event === 'payment.failed') {
			order.payment.status = PaymentStatus.failure
		}

		order.payment.paymentId = entity.id
		order.payment.orderId = entity.order_id
		order.payment.paymentMode = entity.method
		const updatedOrder = await order.save()

		const user = await User.findById(order.buyer.id)

		await aws.ses.sendMailPromise({
			from: 'noreply@botiga.app',
			to: 'support@botiga.app',
			subject: `Botiga - Payment Event - ${order.seller.brandName} - ${order.order.number} - ${event}`,
			text: `Payment Database Status
				<br><br>${updatedOrder.payment}
				<br><br>Team Botiga`
		})

		// Send seller email in case of failure
		if (event === 'payment.failed') {
			winston.error(`@webhook payment failure - ${entity.id}`, {
				paymentId: entity.id,
				orderNumber: order.order.number,
				brand: order.seller.brandName,
				payment: updatedOrder.payment
			})

			user.sendNotifications(
				'Payment Failure',
				`Your payment of ₹${order.order.totalAmount} for order #${order.order.number} to ${order.seller.brandName} has failed. Any amount debited will be credited back to your account.`,
				entity.notes.orderId
			)

			await aws.ses.sendMailPromise({
				from: 'noreply@botiga.app',
				to: 'support@botiga.app',
				subject: `Botiga - Server Payment Failure Notification - Order #${order.order.number} - ${order.apartment.aptName} `,
				text: `Payment Failure Notification
				<br><br>Please remind the customer to make the payment via Remind option in your order detail screen.
				<br>Confirm the order before delivering. If users confirms the order, ask him to retry payment.
				<br><br>Thank you
				<br>Team Botiga`
			})
		} else {
			// Payment Captured event was registered. If order payment status is not success, order payment update failed
			if (updatedOrder.payment.status !== PaymentStatus.success) {
				throw new Error('Payment Order status Success not updated in db')
			}

			winston.info(`@webhook payment success - ${entity.id}`, {
				paymentId: entity.id,
				orderNumber: order.order.number,
				brand: order.seller.brandName,
				payment: updatedOrder.payment
			})

			user.sendNotifications(
				'Payment Success',
				`Your payment of ₹${order.order.totalAmount} for order #${order.order.number} to ${order.seller.brandName} has been successful`,
				entity.notes.orderId
			)
		}
		return null
	} catch (error) {
		winston.error('@payment webhook failed', {
			error,
			errorMessage: error.message,
			event: data.event,
			data: data.payload
		})

		return Promise.reject(new CreateHttpError[500]('Payment Webhook Failure'))
	}
}

const downtimeWebhook = async (data, signature) => {
	try {
		webhookSignatureVerification(data, signature)

		const { event, payload } = data
		winston.info('@downtime webhook data', {
			event,
			payload
		})

		const { entity } = payload['payment.downtime']
		return await aws.ses.sendMailPromise({
			from: 'noreply@botiga.app',
			to: 'varun@botiga.app',
			subject: `Botiga - Downtime Webhook - ${entity.status}`,
			text: `RazorPay Downtime Notification
				<br><br>Downtime Info:
				<br>Event - ${event}
				<br>Id - ${entity.id}
				<br>Method - ${entity.method}
				<br>Status - ${entity.status}
				<br>Severity - ${entity.severity}
				<br>Scheduled - ${entity.scheduled}
				<br>Instrument - ${entity.instrument.issuer}
				`
		})
	} catch (error) {
		return winston.error('@downtime webhook failed', {
			error,
			errorMessage: error.message,
			event: data.event,
			data: data.payload
		})
	}
}

export default {
	routeTransaction,
	initiateTransaction,
	paymentWebhook,
	downtimeWebhook
}
