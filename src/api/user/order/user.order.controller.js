import CreateHttpError from 'http-errors'

import { token, paginationData, skipData } from '../../../util'

import {
	createOrder,
	findCategoryProducts,
	findOrderForUser,
	findOrders
} from './user.order.dao'

export const postOrder = async (req, res, next) => {
	const {
		sellerId,
		apartmentContact: { phone, whatsapp, email },
		deliveryDate,
		totalAmount,
		products
	} = req.body

	try {
		// Verify Seller Id
		const order = await createOrder({
			userId: token.get(req),
			sellerId,
			deliveryDate,
			sellerContact: { phone, whatsapp, email },
			totalAmount,
			products
		})

		res.status(201).json(order)
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
			if (_product) {
				totalAmount += quantity * _product.price
				return {
					productId,
					quantity,
					price: _product.price,
					available: _product.available
				}
			} else {
				return { productId, quantity, available: false }
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
		// Verify Seller Id
		const order = await findOrderForUser(orderId, token.get(req))

		order.order.status = 'cancelled'
		await order.save()

		// TODO: Notify seller about the status change
		res.json({ message: 'cancelled', id: order._id })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
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

		const filteredOrderedData = orders.map(odr => {
			const {
				seller,
				order: {
					number,
					status,
					totalAmount,
					orderDate,
					expectedDeliveryDate,
					completionDate,
					products
				},
				_id
			} = odr

			return {
				id: _id,
				seller,
				number,
				status,
				totalAmount,
				orderDate,
				expectedDeliveryDate,
				completionDate,
				products
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
