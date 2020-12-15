import CreateHttpError from 'http-errors'

import { token, otp } from '../../../util'
import {
	createSeller,
	findSellerByNumber,
	updateToken
} from './seller.auth.dao'

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

		// Check if seller already exist
		const seller = await findSellerByNumber(phone)
		if (!seller) {
			return res.json({
				message: 'createSeller',
				phone,
				createToken: token.generateToken(phone)
			})
		}

		// Else, signIn seller
		const {
			owner: { firstName, lastName },
			brand,
			contact
		} = seller

		// Add jwt token
		token.set(res, seller._id)

		return res.json({
			firstName,
			lastName,
			brandName: brand.name,
			phone: contact.phone,
			whatsapp: contact.whatsapp
		})
	} catch (error) {
		const { status, message } = error
		return next(new CreateHttpError(status, message))
	}
}

export const postSellerSignup = async (req, res, next) => {
	const {
		businessName,
		firstName,
		lastName,
		brandName,
		businessCategory,
		brandUrl,
		tagline,
		phone,
		createToken
	} = req.body

	try {
		// Validation of create request using create token
		const val = token.extractPayload(createToken)

		if (val !== phone) {
			throw new CreateHttpError[400]('Token value mismatch with phone number')
		}

		const seller = await createSeller({
			businessName,
			firstName,
			lastName,
			brandName,
			businessCategory,
			brandUrl,
			tagline,
			phone
		})

		// Add jwt token
		token.set(res, seller._id)

		res.status(201).json({ id: seller._id })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postSellerSignout = (_, res, next) => {
	try {
		// TODO: Invalidate token on signout
		res.status(204).json()
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchPushToken = async (req, res, next) => {
	try {
		const message = await updateToken(token.get(req), req.body.token)

		res.json({ message })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
