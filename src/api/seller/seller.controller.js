import CreateHttpError from 'http-errors'
import { token } from '../../util'
import { createCategory } from './seller.dao'

export const postCategory = async (req, res, next) => {
	try {
		const { products } = await createCategory(token.get(req), req.body.name)

		res.status(201).json({ category: products[products.length - 1] })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
