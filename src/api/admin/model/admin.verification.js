import CreateHttpError from 'http-errors'

import { token } from '../../../util'
import { Admin } from './admin.model'

export const adminAuthMiddleware = async (req, res, next) => {
	try {
		if (!req.get(token.authToken)) {
			throw new CreateHttpError[400]('Bad Request - Token Missing')
		}
		const admin = await Admin.findById(token.get(req))
		if (!admin) {
			throw new CreateHttpError[401]('Admin not found')
			// return Promise.reject(new CreateHttpError[401]('Admin not found'))
		} else {
			next()
		}
	} catch (error) {
		const { status, message, errors } = error
		res.status(status).json({ message, errors })
	}
}
