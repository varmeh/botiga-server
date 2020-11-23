import CreateHttpError from 'http-errors'

import { token, otp } from '../../../util'
import {
	createUser,
	findUserByNumber,
	findUser,
	updateUserProfile,
	updateUserAddress,
	updateToken
} from './user.auth.dao'

const extractUserProfile = user => {
	const {
		firstName,
		lastName,
		contact: { phone, whatsapp, email, address }
	} = user

	if (address.length === 0) {
		return {
			firstName,
			lastName,
			phone,
			whatsapp,
			email
		}
	}

	const [{ aptId, house, aptName, area, city, state, pincode }] = address

	return {
		firstName,
		lastName,
		phone,
		whatsapp,
		email,
		address: {
			id: aptId,
			house,
			apartment: aptName,
			area,
			city,
			state,
			pincode
		}
	}
}

export const getOtp = async (req, res, next) => {
	const { phone } = req.params
	try {
		const sessionId = await otp.send(phone, 'SignupTemplate')
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
		const user = await findUserByNumber(phone)
		if (!user) {
			return res.json({ message: 'createUser', phone })
		}

		// Add jwt token
		token.set(res, user._id)

		return res.json(extractUserProfile(user))
	} catch (error) {
		const { status, message } = error
		return next(new CreateHttpError(status, message))
	}
}

export const postUserSignup = async (req, res, next) => {
	const { firstName, lastName, phone, whatsapp, email } = req.body

	try {
		const user = await createUser({
			firstName,
			lastName,
			phone,
			whatsapp,
			email
		})

		// Add jwt token
		token.set(res, user._id)

		res.status(201).json({ message: 'user created', id: user._id })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postUserSignout = (_, res, next) => {
	try {
		// TODO: Invalidate token on signout
		res.status(204).json()
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getUserProfile = async (req, res, next) => {
	try {
		const user = await findUser(token.get(req))
		res.json(extractUserProfile(user))
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchUserProfile = async (req, res, next) => {
	const { firstName, lastName, email, whatsapp } = req.body
	try {
		const user = await updateUserProfile(token.get(req), {
			firstName,
			lastName,
			email,
			whatsapp
		})
		res.json({
			message: 'profile updated',
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			whatsapp: user.whatsapp
		})
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchUserAddress = async (req, res, next) => {
	const { house, apartmentId } = req.body
	try {
		await updateUserAddress(token.get(req), house, apartmentId)

		res.json({
			message: 'updated address'
		})
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchUserPushToken = async (req, res, next) => {
	try {
		const message = await updateToken(token.get(req), req.body.token)

		res.json({ message })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
