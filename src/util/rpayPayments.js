import axios from 'axios'
import CreateHttpError from 'http-errors'
import Razorpay from 'razorpay'

import { Order, OrderStatus, PaymentStatus, User } from '../models'
import { winston } from './winston.logger'
import aws from './aws'

const TEST_TRANSACTION = 'testTransaction'

const ROUTE_CHARGES = 0.12 / 100 // represents 0.12 %

const { RPAY_HOST, RPAY_ID, RPAY_SECRET, RPAY_WEBHOOK_SECRET } = process.env

const authToken = Buffer.from(`${RPAY_ID}:${RPAY_SECRET}`, 'utf8').toString(
	'base64'
)

const initiateTestTransaction = async ({ txnAmount, sellerMid }) => {
	try {
		const mdrCharges = txnAmount * ROUTE_CHARGES
		const amountToBeTransfered = txnAmount - mdrCharges

		const payload = {
			amount: txnAmount * 100,
			currency: 'INR',
			notes: { orderId: TEST_TRANSACTION },
			transfers: [
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
		winston.error('@payment initiateTestTransaction failed', {
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

		const payload = {
			amount: txnAmount * 100,
			currency: 'INR',
			notes: { orderId, orderNumber: order.order.number }
		}

		const { data } = await axios.post(`${RPAY_HOST}/orders`, payload, {
			headers: {
				Authorization: `Basic ${authToken}`
			}
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

const dbStatusUpdate = async ({ event, entity, order }) => {
	try {
		const { payment } = order

		payment.paymentId = entity.id
		payment.orderId = entity.order_id
		payment.paymentMode = entity.method

		if (entity.method === 'card') {
			const { card } = entity
			payment.paymentMode = card.type // debit or credit
			payment.description = `${card.network} ${card.last4}`
		} else if (entity.method === 'netbanking') {
			payment.description = entity.bank
		}

		if (event === 'payment.captured') {
			order.order.status = OrderStatus.open
			payment.status = PaymentStatus.success

			payment.transferAmount = entity.amount / 100
			payment.fee = entity.fee / 100
			payment.tax = entity.tax / 100
		} else {
			// Cancel Order if payment failed
			order.order.status = OrderStatus.cancelled
			payment.status = PaymentStatus.failure
		}

		const updatedOrder = await order.save()

		await aws.ses.sendMailPromise({
			from: 'noreply@botiga.app',
			to: 'support@botiga.app',
			subject: `Botiga - Payment Event - ${order.seller.brandName} - ${order.order.number} - ${event}`,
			text: `Payment Database Status
				<br><br>${updatedOrder.payment}
				<br><br>Team Botiga`
		})

		return updatedOrder
	} catch (error) {
		winston.error('@payment dbStatusUpdate failed', {
			error,
			msg: error.message
		})
		return Promise.reject(new Error(error.message))
	}
}

const populateProductDetails = products => {
	let details = ''
	products.forEach(product => {
		details += `<br>${product.quantity} x ${product.name} ${
			product.unitInfo
		} - ₹${product.price * product.quantity}`
	})
	return details
}

const routePayment = async order => {
	try {
		const { payment } = order
		const routeCharges = payment.transferAmount * ROUTE_CHARGES
		const amountToBeTransfered = payment.transferAmount - routeCharges
		const payload = {
			transfers: [
				{
					account: order.seller.accountId,
					amount: Math.ceil(amountToBeTransfered * 100),
					currency: 'INR'
				}
			]
		}

		const { data } = await axios.post(
			`${RPAY_HOST}/payments/${order.payment.id}/transfers`,
			payload,
			{
				headers: {
					Authorization: `Basic ${authToken}`
				}
			}
		)

		return data
	} catch (error) {
		winston.error('@payment routePayment failed', {
			error,
			msg: error.message
		})
		return Promise.reject(new Error(error.message))
	}
}

const paymentWebhook = async (data, signature) => {
	try {
		// 1. Verify if it's a call from Razorpay server only
		webhookSignatureVerification(data, signature)

		const {
			event,
			payload: {
				payment: { entity }
			}
		} = data

		// 2. Return if it's a test transaction
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
		// Payment webhooks could be received in any order, so, older failure webhooks could override success status
		if (order.payment.status === PaymentStatus.success) {
			return null
		}

		// 3. Update database for payment info
		const updatedOrder = await dbStatusUpdate({
			event,
			entity,
			order
		})

		const user = await User.findById(order.buyer.id)

		if (event === 'payment.captured') {
			// Payment Captured event was registered. If order payment status is not success, order payment update failed
			if (updatedOrder.payment.status !== PaymentStatus.success) {
				throw new Error('DB Payment Update Failure')
			}

			// Route Payment
			await routePayment(updatedOrder)

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

			// Send seller message that order has been created
			const { buyer, apartment } = order
			await aws.ses.sendMailPromise({
				from: 'noreply@botiga.app',
				to: order.seller.email,

				subject: `Botiga - Order Received #${order.order.number} - ${apartment.aptName} `,
				text: `Order Details
				<br><br>Customer - ${buyer.name} - ${buyer.phone}
				<br>Delivery Address:
				<br>Flat No - ${buyer.house}
				<br>Apartment - ${apartment.aptName}, ${order.apartment.area}
				<br>${populateProductDetails(order.order.products)} 
				<br><br>Total Amount - ₹${order.order.totalAmount}
				<br><br>Thank you
				<br>Team Botiga`
			})
		} else if (event === 'payment.failed') {
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
				<br><br>Customer - ${order.buyer.name} - ${order.$isDeletedbuyer.phone}
				<br><br>Total Amount - ₹${order.order.totalAmount}
				<br><br>Thank you
				<br>Team Botiga`
			})
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
	initiateTestTransaction,
	initiateTransaction,
	paymentWebhook,
	downtimeWebhook
}
