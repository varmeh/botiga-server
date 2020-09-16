import CreateHttpError from 'http-errors'
import { winston } from '../../../util'
import { Seller } from '../../../models'

const logDbError = error => ({ error, msg: error?.message })
const promiseRejectServerError = () =>
	Promise.reject(new CreateHttpError[500]())

/* Helper Methods */
const findProductHelper = async (sellerId, categoryId, productId) => {
	try {
		const seller = await Seller.findById(sellerId)
		const category = seller.categories.id(categoryId)

		if (!category) {
			return Promise.reject(new CreateHttpError[404]('Category Not Found'))
		}

		const product = category.products.id(productId)
		if (!product) {
			return Promise.reject(new CreateHttpError[404]('Product Not Found'))
		}

		return [seller, product]
	} catch (error) {
		winston.debug('@error findProductHelper', logDbError(error))
		return promiseRejectServerError()
	}
}

export const createProduct = async (
	sellerId,
	categoryId,
	{ name, description, price, size, imageUrl }
) => {
	try {
		const seller = await Seller.findById(sellerId)
		const category = seller.categories.id(categoryId)
		if (!category) {
			return Promise.reject(new CreateHttpError[404]('Category Not Found'))
		}
		category.products.push({ name, description, price, size, imageUrl })
		const updatedSeller = await seller.save()
		const { products } = updatedSeller.categories.id(categoryId)
		return products[products.length - 1]
	} catch (error) {
		winston.debug('@error createProduct', logDbError(error))
		return promiseRejectServerError()
	}
}

export const findProducts = async sellerId => {
	try {
		const { categories } = await Seller.findById(sellerId)
		return categories
	} catch (error) {
		winston.debug('@error findProduct', logDbError(error))
		return promiseRejectServerError()
	}
}

export const removeProduct = async (sellerId, categoryId, productId) => {
	try {
		const [seller, product] = findProductHelper(sellerId, categoryId, productId)

		product.remove()
		return await seller.save()
	} catch (error) {
		winston.debug('@error removeProduct', logDbError(error))
		return promiseRejectServerError()
	}
}

export const updateProduct = async ({
	sellerId,
	categoryId,
	productId,
	name,
	description,
	price,
	size: { quantity, unit },
	imageUrl
}) => {
	try {
		const [seller, product] = await findProductHelper(
			sellerId,
			categoryId,
			productId
		)

		const oldImageUrl = product.imageUrl

		// Update Product Information
		if (name) {
			product.name = name
		}
		if (description) {
			product.description = description
		}
		if (price) {
			product.price = price
		}
		if (quantity) {
			product.size.quantity = quantity
		}
		if (unit) {
			product.size.unit = unit
		}
		if (imageUrl) {
			product.imageUrl = imageUrl
		}

		const updatedSeller = await seller.save()
		const updatedProduct = updatedSeller.categories
			.id(categoryId)
			.products.id(productId)
		return [updatedProduct, oldImageUrl]
	} catch (error) {
		winston.debug('@error updateProduct', logDbError(error))
		return promiseRejectServerError()
	}
}
