import jwt from 'jsonwebtoken'
import CreateHttpError from 'http-errors'
import { winston } from './winston.logger'

const authHttpHeader = 'Authorization'
const jwtExpirySeconds =
	process.env.NODE_ENV === 'production' ? 12 * 60 : 30 * 60 // 12 mins for Prod, 30 mins for dev

const generateToken = id =>
	jwt.sign({ id }, process.env.JWT_SECRET, {
		algorithm: 'HS256',
		expiresIn: jwtExpirySeconds
	})

const extractPayload = token => {
	try {
		const { id } = jwt.verify(token, process.env.JWT_SECRET)
		return id // Could return null if NO id exists in extracted payload
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			// if the error thrown is because the JWT is unauthorized, return a 401 error
			throw new CreateHttpError[401]('Uauthorized - Invalid Token')
		}
		// otherwise, return a bad request error
		throw new CreateHttpError[400]('Bad Request - Invalid Token')
	}
}

/* Methods to add & retrieve authorization tokens */
const set = (res, id) => res.set(authHttpHeader, generateToken(id))

const get = req => extractPayload(req.get(authHttpHeader))

/* Middlewares to authenticate & refresh tokens */
const authenticationMiddleware = (req, _res, next) => {
	if (!req.get(authHttpHeader)) {
		winston.error('Auth Token Missing')
		throw new CreateHttpError[400]('Bad Request - Token Missing')
	} else {
		// Extract payload throws errors for stale tokens
		extractPayload(req.get(authHttpHeader))
	}
	next()
}

const refreshMiddleware = (req, res, next) => {
	const id = extractPayload(req.get(authHttpHeader))

	// Set refreshed tokens on response object
	set(res, id)
	next()
}

export default { get, set, authenticationMiddleware, refreshMiddleware }
