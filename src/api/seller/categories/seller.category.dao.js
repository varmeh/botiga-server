import CreateHttpError from 'http-errors'
import { winston } from '../../../util'
import { Seller } from '../../../models'

const logDbError = error => ({ error, msg: error?.message })
const promiseRejectServerError = error => {
	if (error.status && error.message) {
		return Promise.reject(new CreateHttpError[error.status](error.message))
	}
	return Promise.reject(new CreateHttpError[500]())
}

const sortCategory = async sellerId => {
	try {
		return await Seller.updateOne(
			{ _id: sellerId },
			{
				$push: {
					categories: { $each: [], $sort: { name: 1 } }
				}
			}
		)
	} catch (error) {
		winston.debug('@error sortCategory', logDbError(error))
		return promiseRejectServerError(error)
	}
}

export const createCategory = async (sellerId, categoryName) => {
	try {
		const seller = await Seller.findById(sellerId)
		seller.categories.push({ name: categoryName })
		const updatedSeller = await seller.save()

		await sortCategory(seller)

		return updatedSeller.categories.filter(
			category => category.name === categoryName
		)[0]
	} catch (error) {
		winston.debug('@error createCategory', logDbError(error))
		return promiseRejectServerError(error)
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
		return promiseRejectServerError(error)
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
		return promiseRejectServerError(error)
	}
}

export const updateCategory = async (sellerId, categoryName, categoryId) => {
	try {
		const [seller, category] = await findCategoryHelper(sellerId, categoryId)

		// Update category name
		category.name = categoryName
		const updatedSeller = await seller.save()

		// Sort the Categories
		await sortCategory(sellerId)

		return updatedSeller.categories.id(categoryId)
	} catch (error) {
		winston.debug('@error updateCategory', logDbError(error))
		return promiseRejectServerError()
	}
}

export const updateCategoryVisibility = async ({
	sellerId,
	categoryId,
	visible
}) => {
	try {
		const [seller, category] = await findCategoryHelper(sellerId, categoryId)

		category.visible = visible

		const updatedSeller = await seller.save()

		return updatedSeller.categories.id(categoryId)
	} catch (error) {
		winston.debug('@error updateCategoryVisibility', logDbError(error))
		return promiseRejectServerError(error)
	}
}

export const findCategories = async sellerId => {
	try {
		const { categories } = await Seller.findById(sellerId)
		return categories
	} catch (error) {
		winston.debug('@error findProduct', logDbError(error))
		return promiseRejectServerError(error)
	}
}
