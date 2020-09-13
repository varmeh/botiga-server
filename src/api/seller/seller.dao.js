import CreateHttpError from 'http-errors'
import { winston } from '../../util'
import { Seller } from '../../models'

/****************************************************************
 *	Category DAO
 ****************************************************************/
export const createCategory = async (sellerId, categoryName) => {
	try {
		const seller = await Seller.findById(sellerId)
		seller.categories.push({ name: categoryName })
		return seller.save()
	} catch (error) {
		winston.debug('@error createCategory', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findCategory = async sellerId => {
	try {
		const { categories } = await Seller.findById(sellerId)
		return categories
	} catch (error) {
		winston.debug('@error findCategory', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const removeCategory = async (sellerId, categoryId) => {
	try {
		const seller = await Seller.findById(sellerId)
		const category = seller.categories.id(categoryId)

		if (!category) {
			return Promise.reject(new CreateHttpError[404]())
		}

		// Deletion allowed only when category has no products
		if (category.products.length > 0) {
			return Promise.reject(
				new CreateHttpError[405]('category have products - removal not allowed')
			)
		}
		category.remove()
		return await seller.save()
	} catch (error) {
		winston.debug('@error removeCategory', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const updateCategory = async (sellerId, categoryName, categoryId) => {
	try {
		const seller = await Seller.findById(sellerId)
		const category = seller.categories.id(categoryId)

		if (!category) {
			return Promise.reject(new CreateHttpError[404]())
		}

		// Update category name
		category.name = categoryName
		const updatedSeller = await seller.save()
		return updatedSeller.categories.id(categoryId)
	} catch (error) {
		winston.debug('@error updateCategory', { error })
		return Promise.reject(new CreateHttpError[500]())
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
			return Promise.reject(new CreateHttpError[404]('Incorrect category id'))
		}
		category.products.push({ name, description, price, size, imageUrl })
		const updatedSeller = await seller.save()
		const { products } = updatedSeller.categories.id(categoryId)
		return products[products.length - 1]
	} catch (error) {
		winston.debug('@error createProduct', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findProduct = async sellerId => {
	try {
		const { categories } = await Seller.findById(sellerId)
		return categories
	} catch (error) {
		winston.debug('@error findProduct', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const removeProduct = async (sellerId, categoryId) => {
	try {
		const seller = await Seller.findById(sellerId)
		const category = seller.categories.id(categoryId)

		if (!category) {
			return Promise.reject(new CreateHttpError[404]())
		}

		// Deletion allowed only when category has no products
		if (category.products.length > 0) {
			return Promise.reject(
				new CreateHttpError[405]('category have products - removal not allowed')
			)
		}
		category.remove()
		return await seller.save()
	} catch (error) {
		winston.debug('@error removeProduct', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const updateProduct = async (sellerId, categoryName, categoryId) => {
	try {
		const seller = await Seller.findById(sellerId)
		const category = seller.categories.id(categoryId)

		if (!category) {
			return Promise.reject(new CreateHttpError[404]())
		}

		// Update category name
		category.name = categoryName
		const updatedSeller = await seller.save()
		return updatedSeller.categories.id(categoryId)
	} catch (error) {
		winston.debug('@error updateProduct', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}
