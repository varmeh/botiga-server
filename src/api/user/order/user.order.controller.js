import { Seller, Order, PaymentStatus } from '../../../models'

import {
	token,
	paginationData,
	skipData,
	notifications,
	rpayPayments,
	aws,
	controllerErroHandler
} from '../../../util'

import {
	createOrder,
	findCategoryProducts,
	cancelOrder,
	findOrders,
	findOrderById
} from './user.order.dao'

const orderOrchestrator = order => {
	const {
		seller,
		apartment,
		buyer,
		order: {
			number,
			status,
			totalAmount,
			discountAmount,
			couponCode,
			deliveryFee,
			expectedDeliveryDate,
			deliverySlot,
			completionDate,
			products
		},
		createdAt,
		_id,
		payment,
		refund
	} = order

	return {
		id: _id,
		seller,
		number,
		status,
		totalAmount,
		discountAmount,
		couponCode,
		deliveryFee,
		orderDate: createdAt,
		expectedDeliveryDate,
		deliverySlot,
		completionDate,
		products,
		payment,
		refund,
		house: buyer.house,
		apartment: apartment.aptName
	}
}

export const getOrders = async (req, res, next) => {
	try {
		const { skip, limit, page } = skipData(req.query)
		const [totalOrders, orders] = await findOrders({
			userId: token.get(req),
			skip,
			limit
		})

		const filteredOrderedData = orders.map(order => orderOrchestrator(order))

		res.json({
			...paginationData({ limit, totalOrders, currentPage: page }),
			orders: filteredOrderedData
		})
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getOrderWithId = async (req, res, next) => {
	try {
		const order = await findOrderById(req.params.orderId)

		res.json(orderOrchestrator(order))
	} catch (error) {
		controllerErroHandler(error, next)
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

export const postOrder = async (req, res, next) => {
	const {
		sellerId,
		addressId,
		totalAmount,
		couponCode,
		discountAmount,
		deliveryFee,
		products
	} = req.body

	try {
		// Verify Seller Id
		const order = await createOrder({
			userId: token.get(req),
			sellerId,
			addressId,
			totalAmount,
			couponCode,
			deliveryFee,
			discountAmount,
			products
		})

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

		res.status(201).json(orderOrchestrator(order))
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

/* This api verifies products availability before payment */
export const postProductsValidate = async (req, res, next) => {
	const { sellerId, products } = req.body

	try {
		// Verify Seller Id
		const categoryProducts = await findCategoryProducts(sellerId)
		const productDictionary = {}

		// Create validation dictionary
		categoryProducts.forEach(category => {
			category.products.forEach(product => {
				const { id, available, price } = product
				productDictionary[id] = { available, price }
			})
		})

		let totalAmount = 0

		const validateList = products.map(product => {
			const { productId, quantity } = product

			const _product = productDictionary[productId]
			if (_product.available) {
				totalAmount += quantity * _product.price
			}
			return {
				productId,
				quantity,
				price: _product.price,
				available: _product.available
			}
		})

		res.json({ totalAmount, products: validateList })
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postCancelOrder = async (req, res, next) => {
	const { orderId } = req.body

	try {
		const order = await cancelOrder(orderId, token.get(req))

		// Send notification to seller devices
		const seller = await Seller.findById(order.seller.id)
		seller.contact.pushTokens.forEach(token =>
			notifications.sendToUser(
				token,
				'Order Cancelled',
				`Order #${order.order.number} has been cancelled`,
				order._id
			)
		)

		// Send email to seller
		const { buyer, apartment } = order
		await aws.ses.sendMailPromise({
			from: 'noreply@botiga.app',
			to: order.seller.email,
			subject: `Botiga - Order Cancelled #${order.order.number} - ${apartment.aptName} `,
			text: `Order Details
			<br><br>Customer - ${buyer.name} - ${buyer.phone}
			<br>${populateProductDetails(order.order.products)} 
			<br><br>Total Amount - ₹${order.order.totalAmount}
			<br><br>Thank you
			<br>Team Botiga`
		})

		res.json({ message: 'cancelled', id: order._id })
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postRpayTransaction = async (req, res, next) => {
	try {
		const order = await Order.findById(req.body.orderId)
		const data = await rpayPayments.initiateTransaction({
			txnAmount: order.order.totalAmount,
			orderId: order._id
		})

		res.json(data)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postRpayTransactionWebhook = async (req, res, next) => {
	try {
		const { body, headers } = req
		await rpayPayments.paymentWebhook(body, headers['x-razorpay-signature'])
		res.json()
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postRpayDowntimeWebhook = async (req, res, next) => {
	try {
		const { body, headers } = req
		await rpayPayments.downtimeWebhook(body, headers['x-razorpay-signature'])
		res.json()
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postRpayTransactionCancelled = async (req, res, next) => {
	try {
		const order = await Order.findById(req.body.orderId)
		order.payment.status = PaymentStatus.failure
		await order.save()

		await aws.ses.sendMailPromise({
			from: 'noreply@botiga.app',
			to: order.seller.email,
			subject: `Botiga - App Payment Failure Notification for Order #${order.order.number} - ${order.apartment.aptName} `,
			text: `Order Details
				<br>Please remind the customer to make the payment via Remind option in your order detail screen.
				<br>Confirm the order before delivering. If users confirms the order, ask him to retry payment.
				<br><br>Thank you
				<br>Team Botiga`
		})

		res.status(204).json()
	} catch (error) {
		controllerErroHandler(error, next)
	}
}
