import CreateHttpError from 'http-errors'
import { validationResult } from 'express-validator'

import { winston } from './winston.logger'

/* Send Error Response to client */
export const errorResponseMiddleware = (error, _req, res, _next) => {
	const { status, message, errors } = error
	res.status(status).json({ message, errors })
}

/* Standardized Error */
class ValidationError extends Error {
	constructor(status, message, errors = []) {
		super(message || 'Internal Server Error')

		// Ensure the name of this error is the same as the class name
		this.name = this.constructor.name
		this.status = status || 500
		this.errors = errors

		winston.debug('@error.manager', {
			'error.message': 'validation errors',
			errors
		})
	}
}

/* Validation Error Handler */
export const validationMiddleware = (req, _res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		// We have validation error
		const [error] = errors.array()
		throw new ValidationError(
			422,
			`${error.param} ${error.msg}`,
			errors.array()
		)
	}
	next()
}

export const dbErrorHandler = (error, origin) => {
	winston.debug(`@error ${origin}`, { error, msg: error?.message })
	if (error.status && error.message) {
		return Promise.reject(new CreateHttpError[error.status](error.message))
	}
	return Promise.reject(new CreateHttpError[500]('Internal Server Error'))
}

export const controllerErroHandler = (error, next) => {
	const { status, message } = error
	next(new CreateHttpError(status, message))
}
