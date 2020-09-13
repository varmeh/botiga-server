import CreateHttpError from 'http-errors'
import { token } from '../../util'
import {
	createCategory,
	removeCategory,
	updateCategory,
	createProduct,
	findProducts,
	updateProduct
} from './seller.dao'

/****************************************************************
 *	Category Controllers
 ****************************************************************/
export const postCategory = async (req, res, next) => {
	try {
		const { categories } = await createCategory(token.get(req), req.body.name)

		res.status(201).json({ category: categories[categories.length - 1] })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getCategories = async (req, res, next) => {
	try {
		const categories = await findProducts(token.get(req))

		res.json(categories.map(({ _id, name }) => ({ id: _id, name })))
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const deleteCategory = async (req, res, next) => {
	try {
		await removeCategory(token.get(req), req.body.categoryId)

		res.status(204).json()
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchCategory = async (req, res, next) => {
	const { name, categoryId } = req.body
	try {
		const category = await updateCategory(token.get(req), name, categoryId)

		res.json({ id: category._id, newCategoryName: category.name })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

/****************************************************************
 *	Product Controllers
 ****************************************************************/

export const postProduct = async (req, res, next) => {
	try {
		const {
			categoryId,
			name,
			description,
			price,
			size: { quantity, unit },
			imageUrl
		} = req.body

		const product = await createProduct(token.get(req), categoryId, {
			name,
			description,
			price,
			size: { quantity, unit },
			imageUrl
		})

		res.status(201).json(product)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getProducts = async (req, res, next) => {
	try {
		const productsCategories = await findProducts(token.get(req))

		res.json(productsCategories)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const deleteProduct = async (req, res, next) => {
	try {
		await removeCategory(token.get(req), req.body.categoryId)

		res.status(204).json()
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchProduct = async (req, res, next) => {
	const {
		categoryId,
		productId,
		name,
		description,
		price,
		size,
		imageUrl
	} = req.body
	try {
		const updatedProduct = await updateProduct({
			sellerId: token.get(req),
			categoryId,
			productId,
			name,
			description,
			price,
			size,
			imageUrl
		})

		res.json(updatedProduct)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
