import CreateHttpError from 'http-errors'
import { token } from '../../util'
import { createCategory, findCategory } from './seller.dao'

export const postCategory = async (req, res, next) => {
	try {
		const { categories } = await createCategory(token.get(req), req.body.name)

		res.status(201).json({ category: categories[categories.length - 1] })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getCategory = async (req, res, next) => {
	try {
		const categories = await findCategory(token.get(req))

		res.json({ categories })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
