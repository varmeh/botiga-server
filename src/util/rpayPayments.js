import { hostname } from 'os'
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

const host = hostname()

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

const dbWebhookUpdate = async ({ event, entity, order }) => {
	const {
		payment,
		seller,
		order: { number }
	} = order

	try {
		payment.paymentId = entity.id
		payment.orderId = entity.order_id
		payment.paymentMode = entity.method

		if (entity.method === 'card') {
			const { card } = entity
			if (card) {
				payment.paymentMode = card.type // debit or credit
				payment.description = `${card.network} ${card.last4}`
			}
		} else if (entity.method === 'netbanking') {
			payment.description = entity.bank
		}

		if (event === 'payment.captured') {
			order.order.status = OrderStatus.open
			payment.status = PaymentStatus.success

			const amountToBeTransferedInPaise =
				entity.amount -
				Math.ceil(entity.fee * 1.18) -
				Math.ceil(entity.amount * ROUTE_CHARGES)

			payment.transferredAmount = amountToBeTransferedInPaise / 100
		} else {
			// Cancel Order if payment failed
			order.order.status = OrderStatus.cancelled
			payment.status = PaymentStatus.failure
			payment.transferredAmount = 0
		}

		const updatedOrder = await order.save()

		await aws.ses.sendMailPromise({
			from: 'noreply@botiga.app',
			to: 'support@botiga.app',
			subject: `Botiga - Payment Event - ${seller.brandName} - ${number} - ${event}`,
			text: `Payment Database Status
				<br><br>Hostname: ${host}
				<br><br>${updatedOrder.payment}
				<br><br>Team Botiga`
		})

		return updatedOrder
	} catch (error) {
		winston.error('@payment dbWebhookUpdate failed', {
			error,
			msg: error.message
		})

		await aws.ses.sendMailPromise({
			from: 'noreply@botiga.app',
			to: 'support@botiga.app',
			subject: `Botiga - Webhook Db Update Failed - ${seller.brandName} - ${number} - ${event}`,
			text: `
				<br><br>Hostname: ${host}
				<br><br>${payment}
				<br><br>Team Botiga`
		})
		return Promise.reject(new Error(error.message))
	}
}

const routePayment = async order => {
	const {
		payment,
		seller,
		order: { number }
	} = order
	try {
		const payload = {
			transfers: [
				{
					account: seller.accountId,
					amount: payment.transferredAmount * 100, // converting into paise
					currency: 'INR'
				}
			]
		}

		const { data } = await axios.post(
			`${RPAY_HOST}/payments/${payment.id}/transfers`,
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

		await aws.ses.sendMailPromise({
			from: 'noreply@botiga.app',
			to: 'support@botiga.app',
			subject: `Botiga - Payment Routing Failed - ${seller.brandName} - ${number}`,
			text: `Routing Failure Info
				<br><br>Hostname: ${host}
				<br><br>Failure Reason: ${error.message}
				<br><br>Team Botiga`
		})

		return Promise.reject(new Error(error.message))
	}
}

const notificationsHelper = async ({ event, entity, order }) => {
	const user = await User.findById(order.buyer.id)

	const {
		buyer,
		apartment,
		order: { number, products, totalAmount },
		seller,
		payment
	} = order

	if (event === 'payment.captured') {
		winston.info(`@webhook payment success - ${entity.id}`, {
			paymentId: entity.id,
			orderNumber: number,
			brand: seller.brandName,
			payment
		})

		user.sendNotifications(
			'Payment Success',
			`Your payment of ₹${totalAmount} for order #${number} to ${seller.brandName} has been successful`,
			entity.notes.orderId
		)

		// Send seller message that order has been created
		let productDetails = ''
		products.forEach(product => {
			productDetails += `<br>${product.quantity} x ${product.name} ${
				product.unitInfo
			} - ₹${product.price * product.quantity}`
		})

		await aws.ses.sendMailPromise({
			from: 'noreply@botiga.app',
			to: order.seller.email,
			subject: `Botiga - Order Received #${number} - ${apartment.aptName} `,
			text: `Order Details
				<br><br>Customer - ${buyer.name} - ${buyer.phone}
				<br>Delivery Address:
				<br>Flat No - ${buyer.house}
				<br>Apartment - ${apartment.aptName}, ${apartment.area}
				<br>${productDetails} 
				<br><br>Total Amount - ₹${totalAmount}
				<br><br>Thank you
				<br>Team Botiga`
		})
	} else if (event === 'payment.failed') {
		winston.error(`@webhook payment failure - ${entity.id}`, {
			paymentId: entity.id,
			orderNumber: number,
			brand: order.seller.brandName,
			payment: order.payment
		})

		user.sendNotifications(
			'Payment Failure',
			`Your payment of ₹${totalAmount} for order #${number} to ${order.seller.brandName} has failed. Any amount debited will be credited back to your account.`,
			entity.notes.orderId
		)

		await aws.ses.sendMailPromise({
			from: 'noreply@botiga.app',
			to: 'support@botiga.app',
			subject: `Botiga - Server Payment Failure Notification - Order #${number} - ${order.apartment.aptName} `,
			text: `Payment Failure Notification
				<br><br>Hostname: ${host}
				<br><br>Customer - ${order.buyer.name} - ${order.$isDeletedbuyer.phone}
				<br><br>Total Amount - ₹${totalAmount}
				<br><br>Thank you
				<br>Team Botiga`
		})
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

		// Payment webhooks order is not guaranteed. So, older failure webhooks could WRONGLY override success status
		if (order.payment.status === PaymentStatus.success) {
			return null
		}

		// 3. Update database for payment info
		const updatedOrder = await dbWebhookUpdate({
			event,
			entity,
			order
		})

		await notificationsHelper({ event, entity, order: updatedOrder })

		if (event === 'payment.captured') {
			// Payment Captured event was registered. If order payment status is not success, order payment update failed
			// if (updatedOrder.payment.status !== PaymentStatus.success) {
			// 	throw new Error('DB Payment Update Failure')
			// }

			// Route Payment
			await routePayment(updatedOrder)
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

export default {
	initiateTestTransaction,
	initiateTransaction,
	paymentWebhook
}
