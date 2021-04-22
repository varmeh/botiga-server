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
		winston.error('@payment initiateTestTransaction error', {
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
		winston.error('@payment initiate transaction error', {
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
				entity.amount - (entity.fee + Math.ceil(entity.amount * ROUTE_CHARGES)) // Fee is inclusive of GST charge

			payment.transferredAmount = amountToBeTransferedInPaise / 100
		} else {
			// Cancel Order if payment failed
			order.order.status = OrderStatus.cancelled
			payment.status = PaymentStatus.failure
			payment.transferredAmount = 0
		}

		const updatedOrder = await order.save()

		// await aws.ses.sendMailPromise({
		// 	from: 'noreply@botiga.app',
		// 	to: 'support@botiga.app',
		// 	subject: `Botiga - Payment Event - ${seller.brandName} - ${number} - ${event}`,
		// 	text: `Payment Database Status
		// 		<br><br>Hostname: ${host}
		// 		<br><br>${updatedOrder.payment}
		// 		<br><br>Team Botiga`
		// })

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
			`${RPAY_HOST}/payments/${payment.paymentId}/transfers`,
			payload,
			{
				headers: {
					Authorization: `Basic ${authToken}`
				}
			}
		)

		return data
	} catch (error) {
		winston.error('@payment routePayment error', {
			error,
			msg: error.message
		})

		await aws.ses.sendMailPromise({
			from: 'noreply@botiga.app',
			to: 'support@botiga.app',
			subject: `Botiga - Payment Routing Failed - ${seller.brandName} - ${number}`,
			text: `Routing Failure Error
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
		order: { number, products, totalAmount, status },
		seller,
		payment
	} = order

	if (event === 'payment.captured') {
		winston.info(`@webhook payment success - ${number}`, {
			paymentId: entity.id,
			orderNumber: number,
			brand: seller.brandName
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
				<br>House No - ${buyer.house}
				<br>Apartment - ${apartment.aptName}, ${apartment.area}
				<br><br>Seller - ${seller.brandName}
				<br>${productDetails} 
				<br>Total Amount - ₹${totalAmount}
				<br><br>Payment Mode - ${payment.paymentMode}
				<br><br>Thank you
				<br>Team Botiga`
		})
	} else if (event === 'payment.failed') {
		winston.error(`@webhook payment failure - ${number}`, {
			paymentId: entity.id,
			orderNumber: number,
			brand: seller.brandName
		})

		user.sendNotifications(
			'Payment Failure',
			`Your payment of ₹${totalAmount} for order #${number} to ${seller.brandName} has failed. Any amount debited will be credited back to your account.`,
			entity.notes.orderId
		)

		await aws.ses.sendMailPromise({
			from: 'noreply@botiga.app',
			to: 'support@botiga.app',
			subject: `Botiga - Server Payment Failure Notification - Order #${number}`,
			text: `Payment Failure Notification
				<br><br>Hostname: ${host}
				<br><br>Customer - ${buyer.name} - ${buyer.phone}
				<br>Address - ${buyer.house} - ${apartment.aptName}
				<br><br>Seller - ${seller.brandName}
				<br>Order Status - ${status}
				<br>Total Amount - ₹${totalAmount}
				<br><br>Payment Status - ${payment}
				<br><br>Thank you
				<br>Team Botiga`
		})
	}
}

const removeFailedOrder = async (orderId, orderNumber) => {
	winston.info(`@removeFailedOrder - ${orderNumber}`, {
		domain: 'webhook',
		orderId,
		orderNumber
	})

	const order = await Order.findById(orderId)

	if (order) {
		if (
			order.order.status === OrderStatus.cancelled &&
			order.payment.status === PaymentStatus.failure
		) {
			await order.remove()

			const {
				buyer,
				apartment,
				order: { number, totalAmount, status },
				seller,
				payment
			} = order

			winston.info(`@removeFailedOrder - ${orderNumber} Removed`, {
				domain: 'webhook',
				orderId,
				orderNumber
			})

			await aws.ses.sendMailPromise({
				from: 'noreply@botiga.app',
				to: 'support@botiga.app',
				subject: `Botiga - Order Removed - #${number}`,
				text: `Order removed due to payment failure
				<br><br>Hostname: ${host}
				<br><br>Customer - ${buyer.name} - ${buyer.phone}
				<br>Address - ${buyer.house} - ${apartment.aptName} 
				<br><br>Seller - ${seller.brandName}
				<br>Order Status - ${status}
				<br>Total Amount - ₹${totalAmount}
				<br><br>Payment Status - ${payment}
				<br><br>Thank you
				<br>Team Botiga`
			})
		}
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
			winston.info('@payment webhook status success already', {
				domain: 'webhook',
				event,
				paymentId: entity.id
			})
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
			await routePayment(updatedOrder)
		} else if (event === 'payment.failed') {
			setTimeout(
				() => removeFailedOrder(entity.notes.orderId, order.order.number),
				60 * 60 * 1000
			) // remove order after 1 hour
		}

		return null
	} catch (error) {
		winston.error('@payment webhook error', {
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
