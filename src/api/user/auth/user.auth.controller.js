import CreateHttpError from 'http-errors'

import { password, token } from '../../../util'
import { createUser, findUserByNumber } from './user.auth.dao'

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
