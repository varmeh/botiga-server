import CreateHttpError from 'http-errors'

import { token, otp } from '../../../util'
import {
	createUser,
	findUserByNumber,
	findUser,
	updateUserProfile,
	updateToken,
	createAddress,
	updateAddress,
	deleteAddress
} from './user.auth.dao'

const extractUserAddress = user => {
	return user.contact.addresses.length === 0
		? []
		: user.contact.addresses.map(address => {
				const {
					_id,
					aptId,
					house,
					aptName,
					area,
					city,
					state,
					pincode
				} = address
				return {
					id: _id,
					aptId,
					house,
					apartment: aptName,
					area,
					city,
					state,
					pincode
				}
		  })
}

const extractUserProfile = user => {
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
		email,
		addresses: extractUserAddress(user)
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
			return res.json({
				message: 'createUser',
				phone,
				createToken: token.generateToken(phone)
			})
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
	const { firstName, lastName, phone, whatsapp, email, createToken } = req.body

	try {
		// Validation of create request using create token
		const val = token.extractPayload(createToken)

		if (val !== phone) {
			throw new CreateHttpError[400]('Token value mismatch with phone number')
		}

		const user = await createUser({
			firstName,
			lastName,
			phone,
			whatsapp,
			email
		})

		// Add jwt token
		token.set(res, user._id)

		res
			.status(201)
			.json({ message: 'user created', ...extractUserProfile(user) })
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

export const patchUserPushToken = async (req, res, next) => {
	try {
		const message = await updateToken(token.get(req), req.body.token)

		res.json({ message })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getUserAddress = async (req, res, next) => {
	try {
		const user = await findUser(token.get(req))

		res.json(extractUserAddress(user))
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postUserAddress = async (req, res, next) => {
	const { house, apartmentId } = req.body
	try {
		await createAddress(token.get(req), house, apartmentId)

		res.status(201).json({ message: 'address created' })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const deleteUserAddress = async (req, res, next) => {
	try {
		await deleteAddress(token.get(req), req.params.id)

		res.status(204).json()
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchUserAddress = async (req, res, next) => {
	const { house, id } = req.body
	try {
		await updateAddress(token.get(req), house, id)

		res.json({
			message: 'updated address'
		})
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
