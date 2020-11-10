import CreateHttpError from 'http-errors'
import { Seller, Order } from '../../../models'

import {
	token,
	paginationData,
	skipData,
	notifications,
	payments
} from '../../../util'

import {
	createOrder,
	findCategoryProducts,
	cancelOrder,
	findOrders
} from './user.order.dao'

export const getOrders = async (req, res, next) => {
	try {
		const { skip, limit, page } = skipData(req.query)
		const [totalOrders, orders] = await findOrders({
			userId: token.get(req),
			skip,
			limit
		})

		const filteredOrderedData = orders.map(odr => {
			const {
				seller,
				order: {
					number,
					status,
					totalAmount,
					expectedDeliveryDate,
					completionDate,
					products
				},
				createdAt,
				_id,
				payment,
				refund
			} = odr

			return {
				id: _id,
				seller,
				number,
				status,
				totalAmount,
				orderDate: createdAt,
				expectedDeliveryDate,
				completionDate,
				products,
				payment,
				refund
			}
		})

		res.json({
			...paginationData({ limit, totalOrders, currentPage: page }),
			orders: filteredOrderedData
		})
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postOrder = async (req, res, next) => {
	const { sellerId, apartmentId, house, totalAmount, products } = req.body

	try {
		// Verify Seller Id
		const newOrder = await createOrder({
			userId: token.get(req),
			sellerId,
			apartmentId,
			house,
			totalAmount,
			products
		})

		const { _id, order, buyer, seller, createdAt, updatedAt } = newOrder

		const data = await payments.initiateTransaction({
			txnAmount: totalAmount,
			orderId: _id,
			customerId: `cust_${buyer.phone.substr(-6, 6)}`
		})

		res
			.status(201)
			.json({ id: _id, order, buyer, seller, createdAt, updatedAt, ...data })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
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
		const { status, message } = error
		next(new CreateHttpError(status, message))
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
				`Order #${order.order.number} has been cancelled`
			)
		)

		res.json({ message: 'cancelled', id: order._id })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

/**
 * Transaction APIs
 * 	- postTransactionRetry
 * 	- postTransactionStatus - callback from paytm webview in flutter app
 */

export const postTransactionRetry = async (req, res, next) => {
	try {
		const order = await Order.findById(req.body.orderId)
		const data = await payments.initiateTransaction({
			txnAmount: order.order.totalAmount,
			orderId: order._id,
			customerId: `cust_${order.buyer.phone.substr(-6, 6)}`
		})

		res.json(data)
	} catch ({ status, message }) {
		next(new CreateHttpError(status, message))
	}
}

export const postTransactionStatus = async (req, res, next) => {
	try {
		const data = await payments.transactionStatus(req.query)

		res.json(data)
	} catch ({ status, message }) {
		next(new CreateHttpError(status, message))
	}
}

export const postTransactionWebhook = (req, res, next) => {
	try {
		console.info('~~~~~~~~~ postTransactionWebhook called ~~~~~~~~~')
		console.info(req.body)
		res.json()
	} catch ({ status, message }) {
		next(new CreateHttpError(status, message))
	}
}
