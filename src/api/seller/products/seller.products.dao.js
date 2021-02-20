import CreateHttpError from 'http-errors'
import { winston } from '../../../util'
import { Seller } from '../../../models'

const logDbError = error => ({ error, msg: error?.message })
const promiseRejectServerError = () =>
	Promise.reject(new CreateHttpError[500]())

/* Helper Methods */
const findCategoryHelper = async (sellerId, categoryId) => {
	try {
		const seller = await Seller.findById(sellerId)
		if (!seller) {
			return Promise.reject(new CreateHttpError[404]('Seller Not Found'))
		}

		const category = seller.categories.id(categoryId)

		if (!category) {
			return Promise.reject(new CreateHttpError[404]('Category Not Found'))
		}

		return { seller, category }
	} catch (error) {
		winston.debug('@error findCategoryHelper', logDbError(error))
		return promiseRejectServerError()
	}
}

const findProductHelper = async (sellerId, categoryId, productId) => {
	try {
		const { seller, category } = await findCategoryHelper(sellerId, categoryId)

		const product = category.products.id(productId)
		if (!product) {
			return Promise.reject(new CreateHttpError[404]('Product Not Found'))
		}

		return { seller, product }
	} catch (error) {
		winston.debug('@error findProductHelper', logDbError(error))
		return promiseRejectServerError()
	}
}

const sortProducts = async (sellerId, categoryId) => {
	try {
		// Sort the products in category
		return await Seller.updateOne(
			{ _id: sellerId },
			{
				$push: {
					'categories.$[element].products': {
						$each: [],
						$sort: { name: 1 }
					}
				}
			},
			{ arrayFilters: [{ 'element._id': categoryId }] }
		)
	} catch (error) {
		winston.debug('@error sortProducts', logDbError(error))
		return promiseRejectServerError()
	}
}

export const createProduct = async (
	sellerId,
	categoryId,
	{
		name,
		description,
		price,
		mrp,
		size,
		imageUrl,
		tag,
		imageUrlLarge,
		secondaryImageUrls
	}
) => {
	try {
		const { seller, category } = await findCategoryHelper(sellerId, categoryId)

		category.products.push({
			name,
			description,
			price,
			mrp,
			size,
			imageUrl,
			tag,
			imageUrlLarge,
			secondaryImageUrls
		})

		const updatedSeller = await seller.save()

		// Sort the products in this category
		await sortProducts(sellerId, categoryId)

		const { products } = updatedSeller.categories.id(categoryId)
		return products[products.length - 1]
	} catch (error) {
		winston.debug('@error createProduct', logDbError(error))
		return promiseRejectServerError()
	}
}

export const findProducts = async sellerId => {
	try {
		const seller = await Seller.findById(sellerId)

		if (!seller) {
			return Promise.reject(new CreateHttpError[404]('Seller Not Found'))
		}

		return seller.categories
	} catch (error) {
		winston.debug('@error findProduct', logDbError(error))
		return promiseRejectServerError()
	}
}

export const removeProduct = async (sellerId, categoryId, productId) => {
	try {
		const { seller, product } = await findProductHelper(
			sellerId,
			categoryId,
			productId
		)

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
	mrp,
	quantity,
	unit,
	imageUrl,
	available,
	updateImage,
	tag,
	imageUrlLarge,
	secondaryImageUrls
}) => {
	try {
		const { seller, product } = await findProductHelper(
			sellerId,
			categoryId,
			productId
		)

		const oldImageUrl = product.imageUrl

		const isNameUpdate = product.name !== name

		// Update Product Information
		product.name = name
		product.description = description
		product.price = price
		product.size.quantity = quantity
		product.size.unit = unit
		if (updateImage && imageUrl && imageUrlLarge) {
			product.imageUrl = imageUrl
			product.imageUrlLarge = imageUrlLarge
		}
		product.available = available

		if (mrp) product.mrp = mrp
		if (tag) product.tag = tag
		if (secondaryImageUrls) product.secondaryImageUrls = secondaryImageUrls

		const updatedSeller = await seller.save()

		if (isNameUpdate) {
			// As product name is updated, sort the products in category
			await sortProducts(sellerId, categoryId)
		}

		const updatedProduct = updatedSeller.categories
			.id(categoryId)
			.products.id(productId)

		return [updatedProduct, oldImageUrl]
	} catch (error) {
		winston.debug('@error updateProduct', logDbError(error))
		return promiseRejectServerError()
	}
}
