import CreateHttpError from 'http-errors'
import { token } from '../../../util'
import {
	createCategory,
	findCategories,
	removeCategory,
	updateCategory,
	updateCategoryVisibility
} from './seller.category.dao'

export const postCategory = async (req, res, next) => {
	try {
		const { _id, name } = await createCategory(token.get(req), req.body.name)

		res.status(201).json({ id: _id, name })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getCategories = async (req, res, next) => {
	try {
		const categories = await findCategories(token.get(req))

		res.json(
			categories.map(({ _id, name, visible }) => ({ id: _id, name, visible }))
		)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const deleteCategory = async (req, res, next) => {
	try {
		await removeCategory(token.get(req), req.params.categoryId)

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

export const patchCategoryVisibility = async (req, res, next) => {
	const { categoryId, visible } = req.body
	try {
		const category = await updateCategoryVisibility({
			sellerId: token.get(req),
			categoryId,
			visible
		})

		res.json({ categoryId: category._id, categoryName: category.name, visible })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
