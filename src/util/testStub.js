import { validationResult } from 'express-validator'

const testExpressValidatorMiddleware = async (req, res, middlewares) => {
	await Promise.all(
		middlewares.map(async middleware => {
			await middleware(req, res, () => null)
		})
	)
}

export const getValidationErrors = async (req, middleware) => {
	await testExpressValidatorMiddleware(req, {}, middleware)
	const { errors } = validationResult(req)
	return errors
}
