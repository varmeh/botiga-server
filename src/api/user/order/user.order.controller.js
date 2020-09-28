import CreateHttpError from 'http-errors'
import { token } from '../../../util'

import { createOrder, findCategoryProducts } from './user.order.dao'

export const postOrder = async (req, res, next) => {
	const {
		sellerId,
		brandName,
		apartmentContact: { phone, whatsapp, email },
		totalAmount,
		products
	} = req.body

	try {
		// Verify Seller Id
		const order = await createOrder({
			userId: token.get(req),
			sellerId,
			brandName,
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
