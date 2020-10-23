import CreateHttpError from 'http-errors'

import { password, token, otp } from '../../../util'
import {
	createUser,
	findUserByNumber,
	findUser,
	updateUserProfile,
	updateUserPin,
	updateUserAddress
} from './user.auth.dao'

const userProfile = user => {
	const {
		firstName,
		lastName,
		contact: { whatsapp, email, address }
	} = user

	const [{ aptId, house, aptName, area, city, state, pincode }] = address

	return {
		firstName,
		lastName,
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
		await otp.verify(sessionId, otpVal)

		// Check if user already exist
		const user = await findUserByNumber(phone)
		if (!user) {
			return res.json({ message: 'createUser', phone })
		}

		// Add jwt token
		token.set(res, user._id)

		return res.json(userProfile(user))
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

export const postUserSigninPin = async (req, res, next) => {
	const { phone, pin } = req.body

	try {
		const user = await findUserByNumber(phone)
		if (!user) {
			throw new CreateHttpError[404]('User Not Found')
		}
		const match = await password.compare(pin, user.loginPin)

		if (match) {
			// Add jwt token
			token.set(res, user._id)

			res.json(userProfile(user))
		} else {
			throw new CreateHttpError[401]('Invalid Credentials')
		}
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
		res.json(userProfile(user))
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

export const patchUserPin = async (req, res, next) => {
	try {
		const hashedPin = await password.hash(req.body.pin)

		await updateUserPin(token.get(req), hashedPin)
		res.json({
			message: 'pin updated'
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
