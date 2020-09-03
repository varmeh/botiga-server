import { winston } from './winston.logger'

/**
 * This logger logs all responses going out of express logging utility
 */
export const requestLogger = (req, _res, next) => {
	const {
		originalUrl,
		method,
		hostname,
		httpVersion,
		ip,
		protocol,
		body,
		socket
	} = req
	const { remoteAddress, remoteFamily } = socket

	winston.info('@logger request', {
		url: originalUrl,
		method,
		hostname,
		httpVersion,
		ip,
		protocol,
		remoteAddress,
		remoteFamily
	})

	winston.debug('@logger request details', {
		url: originalUrl,
		method,
		req: {
			body
		}
	})

	next()
}

/**
 * This logger logs all error reported to central error handler
 */
export const errorLogger = (error, req, _res, next) => {
	const { originalUrl, method, hostname, ip, protocol } = req
	winston.error('@logger error', {
		url: originalUrl,
		method,
		ip,
		hostname,
		protocol,
		statusCode: error.status || 500,
		text: error.message
	})
	next(error)
}

/**
 * This logger logs all responses going out of express logging utility
 */
export const responseLogger = (req, res, next) => {
	const requestStart = Date.now()

	res.on('finish', () => {
		const { originalUrl, method, hostname } = req

		const { statusCode, statusMessage } = res

		winston.info('@logger response', {
			url: originalUrl,
			method,
			hostname,
			response: {
				statusCode,
				statusMessage,
				processingTime: Date.now() - requestStart
			}
		})
	})
	next()
}
