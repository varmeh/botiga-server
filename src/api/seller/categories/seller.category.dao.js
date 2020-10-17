import CreateHttpError from 'http-errors'
import { winston } from '../../../util'
import { Seller } from '../../../models'

const logDbError = error => ({ error, msg: error?.message })
const promiseRejectServerError = () =>
	Promise.reject(new CreateHttpError[500]())

export const createCategory = async (sellerId, categoryName) => {
	try {
		return await Seller.updateOne(
			{ _id: sellerId },
			{
				$push: {
					categories: { $each: [{ name: categoryName }], $sort: { name: 1 } }
				}
			}
		)
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

export const findCategories = async sellerId => {
	try {
		const { categories } = await Seller.findById(sellerId)
		return categories.sort((a, b) => a.name > b.name)
	} catch (error) {
		winston.debug('@error findProduct', logDbError(error))
		return promiseRejectServerError()
	}
}
