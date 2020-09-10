import jwt from 'jsonwebtoken'
import { BadRequest, Unauthorized } from 'http-errors'
import { winston } from './winston.logger'

const appToken = 'access-token'
const jwtExpirySeconds =
	process.env.NODE_ENV === 'production' ? 12 * 60 : 30 * 60 // 12 mins for Prod, 30 mins for dev

const generateToken = id =>
	jwt.sign({ id }, process.env.JWT_SECRET, {
		algorithm: 'HS256',
		expiresIn: jwtExpirySeconds
	})

const extractPayload = token => {
	try {
		return jwt.verify(token, process.env.JWT_SECRET)
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			// if the error thrown is because the JWT is unauthorized, return a 401 error
			throw new Unauthorized('Uauthorized - Invalid Tokens')
		}
		// otherwise, return a bad request error
		throw new BadRequest('Bad Request - Invalid Tokens')
	}
}

const getIdFromToken = token => {
	const payload = extractPayload(token) // Throws error for stale token
	if (payload && payload.id) {
		return payload.id
	}
	return null
}

export const getAppToken = req => getIdFromToken(req.get(appToken))

export const createTokens = (res, appTokenValue) => {
	const token = {}
	token[appToken] = generateToken(appTokenValue)
	res.set(token)
}

export const authenticateTokens = (req, _res, next) => {
	if (!req.get(appToken)) {
		winston.error('Auth Token Missing', {
			tokenStatus: {
				accessToken: !!req.get(appToken)
			}
		})
		throw new BadRequest('Bad Request - Token Missing')
	} else {
		// Extract payload throws errors for stale tokens
		extractPayload(req.get(appToken))
	}
	next()
}

export const refreshTokens = (req, res, next) => {
	const token = {}
	token[appToken] = generateToken(getAppToken(req))

	// Set refreshed tokens on response object
	res.set(token)
	next()
}
