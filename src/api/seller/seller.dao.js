import CreateHttpError from 'http-errors'
import { winston } from '../../util'
import { Seller } from '../../models'

const logDbError = error => ({ error, msg: error?.message })
const promiseRejectServerError = () =>
	Promise.reject(new CreateHttpError[500]())

/****************************************************************
 *	Category DAO
 ****************************************************************/
export const createCategory = async (sellerId, categoryName) => {
	try {
		const seller = await Seller.findById(sellerId)
		seller.categories.push({ name: categoryName })
		return seller.save()
	} catch (error) {
		winston.debug('@error createCategory', logDbError(error))
		return promiseRejectServerError()
	}
}

const findCategoryHelper = async (sellerId, categoryId) => {
	try {
		const seller = await Seller.findById(sellerId)
		const category = seller.categories.id(categoryId)

		if (!category) {
			return Promise.reject(new CreateHttpError[404]('Category Not Found'))
		}
		return [seller, category]
	} catch (error) {
		winston.debug('@error findCategoryHelper', logDbError(error))
		return promiseRejectServerError()
	}
}

export const removeCategory = async (sellerId, categoryId) => {
	try {
		const [seller, category] = await findCategoryHelper(sellerId, categoryId)

		// Deletion allowed only when category has no products
		if (category.products.length > 0) {
			return Promise.reject(
				new CreateHttpError[405]('Deletion permitted for empty categories only')
			)
		}
		category.remove()
		return await seller.save()
	} catch (error) {
		winston.debug('@error removeCategory', logDbError(error))
		return promiseRejectServerError()
	}
}

export const updateCategory = async (sellerId, categoryName, categoryId) => {
	try {
		const [seller, category] = await findCategoryHelper(sellerId, categoryId)

		// Update category name
		category.name = categoryName
		const updatedSeller = await seller.save()
		return updatedSeller.categories.id(categoryId)
	} catch (error) {
		winston.debug('@error updateCategory', logDbError(error))
		return promiseRejectServerError()
	}
}

/****************************************************************
 *	Products DAO
 ****************************************************************/
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

const findProductHelper = async (sellerId, categoryId, productId) => {
	try {
		const [seller, category] = await findCategoryHelper(sellerId, categoryId)

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
	size,
	imageUrl
}) => {
	try {
		const [seller, product] = findProductHelper(sellerId, categoryId, productId)

		const oldImageUrl = product.imageUrl

		// Update Product Information
		product.name = name
		product.description = description
		product.price = price
		product.size = size
		product.imageUrl = imageUrl

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
