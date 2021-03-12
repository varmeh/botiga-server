import CreateHttpError from 'http-errors'
import { dbErrorHandler } from '../../../util'
import { Seller } from '../../../models'

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
		return dbErrorHandler(error, 'sortCategory')
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
		return dbErrorHandler(error, 'createCategory')
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
		return dbErrorHandler(error, 'findCategoryHelper')
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
		return dbErrorHandler(error, 'removeCategory')
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
		return dbErrorHandler(error, 'updateCategory')
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
		return dbErrorHandler(error, 'updateCategoryVisibility')
	}
}

export const findCategories = async sellerId => {
	try {
		const { categories } = await Seller.findById(sellerId)
		return categories
	} catch (error) {
		return dbErrorHandler(error, 'findCategories')
	}
}
