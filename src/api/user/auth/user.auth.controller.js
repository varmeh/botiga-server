import CreateHttpError from 'http-errors'

import { password, token, otp } from '../../../util'
import {
	createUser,
	findUserByNumber,
	updateUserProfile,
	updateUserPin,
	updateUserAddress
} from './user.auth.dao'

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

		const {
			firstName,
			lastName,
			contact: { whatsapp, email, address }
		} = user

		// Add jwt token
		token.set(res, user._id)

		return res.json({
			firstName,
			lastName,
			phone,
			whatsapp,
			email,
			address
		})
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
			// remove user pin before sending user information to frontend
			const {
				firstName,
				lastName,
				contact: { whatsapp, address, email }
			} = user

			// Add jwt token
			token.set(res, user._id)

			res.json({
				firstName,
				lastName,
				phone,
				whatsapp,
				email,
				address: address[0]
			})
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
