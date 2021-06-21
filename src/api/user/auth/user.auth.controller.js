import CreateHttpError from 'http-errors'

import { token, otp, controllerErroHandler, aws } from '../../../util'
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

const JwtTokenExpiryAfterDays = process.env.NODE_ENV === 'production' ? 45 : 5 // 45 days for Prod, 5 days for dev

const extractUserAddress = user => {
	return user.contact.addresses.length === 0
		? []
		: user.contact.addresses.map(address => {
				const { _id, aptId, house, aptName, area, city, state, pincode } =
					address
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
		contact: { phone, whatsapp, email },
		lastUsedAddressId
	} = user

	return {
		firstName,
		lastName,
		phone,
		whatsapp,
		email,
		lastUsedAddressId,
		addresses: extractUserAddress(user)
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
		const user = await findUserByNumber(phone)
		if (!user) {
			return res.json({
				message: 'createUser',
				phone,
				createToken: token.generateToken(phone, JwtTokenExpiryAfterDays)
			})
		}

		// Add jwt token
		token.set(res, user._id, JwtTokenExpiryAfterDays)

		return res.json(extractUserProfile(user))
	} catch (error) {
		return controllerErroHandler(error, next)
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
		token.set(res, user._id, JwtTokenExpiryAfterDays)

		aws.ses.sendMail({
			from: 'noreply@botiga.app',
			to: 'cs@botiga.app',
			subject: `New user signup - ${phone}`,
			text: `Phone - ${phone}<br>Name - ${firstName} ${lastName}`
		})

		res
			.status(201)
			.json({ message: 'user created', ...extractUserProfile(user) })
	} catch (error) {
		aws.ses.sendMail({
			from: 'noreply@botiga.app',
			to: 'cs@botiga.app',
			subject: `New user signup failure - ${phone}`,
			text: `Phone - ${phone}<br>Name - ${firstName} ${lastName}`,
			error
		})
		controllerErroHandler(error, next)
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

export const getUserProfile = async (req, res, next) => {
	try {
		const user = await findUser(token.get(req))
		res.json(extractUserProfile(user))
	} catch (error) {
		controllerErroHandler(error, next)
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
		controllerErroHandler(error, next)
	}
}

export const patchUserPushToken = async (req, res, next) => {
	try {
		const message = await updateToken(token.get(req), req.body.token)

		res.json({ message })
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getUserAddress = async (req, res, next) => {
	try {
		const user = await findUser(token.get(req))

		res.json(extractUserAddress(user))
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postUserAddress = async (req, res, next) => {
	const { house, apartmentId } = req.body
	try {
		await createAddress(token.get(req), house, apartmentId)

		res.status(201).json({ message: 'address created' })
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const deleteUserAddress = async (req, res, next) => {
	try {
		await deleteAddress(token.get(req), req.params.id)

		res.status(204).json()
	} catch (error) {
		controllerErroHandler(error, next)
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
		controllerErroHandler(error, next)
	}
}
