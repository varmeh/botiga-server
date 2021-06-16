import CreateHttpError from 'http-errors'
import { dbErrorHandler } from '../../../util'
import { Seller } from '../../../models'

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
		return dbErrorHandler(error, 'findCategoryHelper')
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
		return dbErrorHandler(error, 'findProductHelper')
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
		return dbErrorHandler(error, 'sortProducts')
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
			imageUrlLarge,
			secondaryImageUrls
		})

		const updatedSeller = await seller.save()

		// Sort the products in this category
		await sortProducts(sellerId, categoryId)

		const { products } = updatedSeller.categories.id(categoryId)
		return products[products.length - 1]
	} catch (error) {
		return dbErrorHandler(error, 'createProduct')
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
		return dbErrorHandler(error, 'findProduct')
	}
}

export const removeProduct = async (sellerId, categoryId, productId) => {
	try {
		const { seller, product } = await findProductHelper(
			sellerId,
			categoryId,
			productId
		)

		if (product.recommend) {
			seller.recommendedProducts.selected -= 1
		}

		product.remove()
		await seller.save()
		return product
	} catch (error) {
		return dbErrorHandler(error, 'removeProduct')
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
	imageUrlLarge,
	secondaryImageUrls
}) => {
	try {
		const { seller, product } = await findProductHelper(
			sellerId,
			categoryId,
			productId
		)

		const isNameUpdate = product.name !== name

		// Update Product Information
		product.name = name
		product.description = description
		product.price = price
		product.size.quantity = quantity
		product.size.unit = unit
		product.available = available

		if (mrp) product.mrp = mrp

		product.imageUrl = imageUrl
		product.imageUrlLarge = imageUrlLarge
		product.secondaryImageUrls = secondaryImageUrls

		const updatedSeller = await seller.save()

		if (isNameUpdate) {
			// As product name is updated, sort the products in category
			await sortProducts(sellerId, categoryId)
		}

		const updatedProduct = updatedSeller.categories
			.id(categoryId)
			.products.id(productId)

		return updatedProduct
	} catch (error) {
		return dbErrorHandler(error, 'updateProduct')
	}
}

export const updateProductRecommendedStatus = async ({
	sellerId,
	categoryId,
	productId,
	recommended
}) => {
	try {
		const { seller, product } = await findProductHelper(
			sellerId,
			categoryId,
			productId
		)

		const {
			recommendedProducts: { allowed, selected }
		} = seller

		if (recommended) {
			const category = seller.categories.id(categoryId)
			if (!category.visible) {
				return Promise.reject(
					new CreateHttpError[401](
						'Recommend Product Only from Visible Categories'
					)
				)
			}

			if (selected < allowed) {
				seller.recommendedProducts.selected = selected + 1
			} else {
				return Promise.reject(
					new CreateHttpError[401](`${allowed} Products Already Recommended`)
				)
			}
		} else {
			if (!product.recommended) {
				return Promise.reject(
					new CreateHttpError[401]('Not A Recommended Product')
				)
			}
			if (selected > 0) {
				seller.recommendedProducts.selected = selected - 1
			}
		}

		product.recommended = recommended

		const updatedSeller = await seller.save()

		const updatedProduct = updatedSeller.categories
			.id(categoryId)
			.products.id(productId)

		return updatedProduct
	} catch (error) {
		return dbErrorHandler(error, 'updateProduct')
	}
}
