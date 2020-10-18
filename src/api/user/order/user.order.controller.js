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

		let totalAmount = 0

		const validateList = products.map(product => {
			const { categoryId, productId, quantity } = product
			const category = categoryProducts.id(categoryId)
			if (!category) {
				// Category mismatch
				return { categoryId, productId, quantity, available: false }
			} else {
				const _product = category.products.id(productId)
				if (!_product || !_product.available) {
					// Product not found or is not available
					return { categoryId, productId, quantity, available: false }
				} else {
					totalAmount += quantity * _product.price
					return { categoryId, productId, quantity, available: true }
				}
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
