import CreateHttpError from 'http-errors'

import { token, otp, controllerErroHandler } from '../../../util'
import { findAdminByNumber, findAdminById } from './admin.auth.dao'

const JwtTokenExpiryAfterDays = process.env.NODE_ENV === 'production' ? 90 : 5 // 90 days for Prod, 5 days for dev

const extractAdminProfile = user => {
	const {
		firstName,
		lastName,
		contact: { phone, whatsapp, email }
	} = user

	return {
		firstName,
		lastName,
		phone,
		whatsapp,
		email
	}
}

export const getOtp = async (req, res, next) => {
	const { phone } = req.params
	try {
		const sessionId = await otp.send(phone, 'OtpLogin')
		res.json({ phone, sessionId })
	} catch (_) {
		next(
			new CreateHttpError[500](
				'OTP Request failed. Check your number & try again'
			)
		)
	}
}

export const postVerifyOtp = async (req, res, next) => {
	const { phone, sessionId, otpVal } = req.body
	try {
		await otp.verify(phone, sessionId, otpVal)

		// Check if user already exist
		const admin = await findAdminByNumber(phone)

		// Add jwt token
		token.set(res, admin._id, JwtTokenExpiryAfterDays)

		return res.json(extractAdminProfile(admin))
	} catch (error) {
		return controllerErroHandler(error, next)
	}
}

export const postUserSignout = (_, res, next) => {
	try {
		// TODO: Invalidate token on signout
		res.status(204).json()
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getAdminProfile = async (req, res, next) => {
	try {
		const admin = await findAdminById(token.get(req))
		res.json(extractAdminProfile(admin))
	} catch (error) {
		controllerErroHandler(error, next)
	}
}
