import CreateHttpError from 'http-errors'

import { password, token, otp } from '../../../util'
import { createUser, findUserByNumber } from './user.auth.dao'

export const getOtp = async (req, res, next) => {
	const { phone } = req.params
	try {
		const sessionId = await otp.send(phone, 'SignupTemplate')
		res.json({ phone, sessionId })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
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

		const { firstName, lastName, gender, apartmentId, deliveryAddress } = user

		// Add jwt token
		token.set(res, user._id)

		res.json({
			firstName,
			lastName,
			gender,
			apartmentId,
			phone,
			deliveryAddress
		})
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postUserSignup = async (req, res, next) => {
	const {
		firstName,
		lastName,
		gender,
		phone,
		pin,
		house,
		apartmentId
	} = req.body

	try {
		const hashedPin = await password.hash(pin)
		const user = await createUser({
			firstName,
			lastName,
			gender,
			phone,
			hashedPin,
			house,
			apartmentId
		})

		// Add jwt token
		token.set(res, user._id)

		res.status(201).json(user)
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
		const match = await password.compare(pin, user.signinPin)

		if (match) {
			// remove user pin before sending user information to frontend
			const {
				firstName,
				lastName,
				gender,
				phone,
				apartmentId,
				deliveryAddress
			} = user

			// Add jwt token
			token.set(res, user._id)

			res.json({
				firstName,
				lastName,
				gender,
				apartmentId,
				phone,
				deliveryAddress
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
