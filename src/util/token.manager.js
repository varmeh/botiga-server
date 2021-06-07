import jwt from 'jsonwebtoken'
import CreateHttpError from 'http-errors'
import { winston } from './winston.logger'

const authToken = 'Authorization'
const secsInDay = 24 * 60 * 60
const Algorithm = 'HS256'
const jwtExpirySeconds =
	process.env.NODE_ENV === 'production' ? 10 * secsInDay : 30 * secsInDay // 10 days for Prod, 30 days for dev

const generateToken = id =>
	jwt.sign({ id }, process.env.JWT_SECRET, {
		algorithm: Algorithm,
		expiresIn: jwtExpirySeconds
	})

const extractPayload = token => {
	try {
		const { id } = jwt.verify(token, process.env.JWT_SECRET, {
			algorithms: [Algorithm]
		})
		return id // Could return null if NO id exists in extracted payload
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			winston.debug('Invalid Token', { token, error })
			// if the error thrown is because the JWT is unauthorized, return a 401 error
			throw new CreateHttpError[401]('Uauthorized - Invalid Token')
		}
		// otherwise, return a bad request error
		throw new CreateHttpError[400]('Bad Request - Invalid Token')
	}
}

/* Methods to add & retrieve authorization tokens */
const set = (res, id) => res.set(authToken, generateToken(id))

const get = req => extractPayload(req.get(authToken))

/* Middlewares to authenticate & refresh tokens */
const authenticationMiddleware = (req, _res, next) => {
	if (!req.get(authToken)) {
		winston.error('Auth Token Missing')
		throw new CreateHttpError[400]('Bad Request - Token Missing')
	}
	// Extract payload throws errors for stale tokens
	extractPayload(req.get(authToken))
	next()
}

const refreshMiddleware = (req, res, next) => {
	const id = extractPayload(req.get(authToken))

	// Set refreshed tokens on response object
	set(res, id)
	next()
}

export default {
	generateToken,
	extractPayload,
	get,
	set,
	authenticationMiddleware,
	refreshMiddleware
}
