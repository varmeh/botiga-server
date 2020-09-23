import CreateHttpError from 'http-errors'

import { password, token, otp } from '../../../util'
import { createSeller, findSellerByNumber } from './seller.auth.dao'

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

		// Check if seller already exist
		const seller = await findSellerByNumber(phone)
		if (!seller) {
			return res.json({ message: 'createSeller', phone })
		}

		// Else, signIn seller
		const {
			owner: { firstName, lastName, gender },
			brand,
			contact
		} = seller

		// Add jwt token
		token.set(res, seller._id)

		res.json({
			firstName,
			lastName,
			gender,
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
		companyName,
		businessCategory,
		firstName,
		lastName,
		gender,
		brandName,
		phone,
		pin
	} = req.body

	try {
		const hashedPin = await password.hash(pin)
		const seller = await createSeller({
			companyName,
			businessCategory,
			firstName,
			lastName,
			gender,
			brandName,
			phone,
			hashedPin
		})

		// Add jwt token
		token.set(res, seller._id)

		res.status(201).json({ id: seller._id })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postSellerLoginWithPin = async (req, res, next) => {
	const { phone, pin } = req.body

	try {
		const seller = await findSellerByNumber(phone)
		if (!seller) {
			throw new CreateHttpError[404]('Seller Not Found')
		}
		const match = await password.compare(pin, seller.pin)

		if (match) {
			// remove seller pin before sending seller information to frontend
			const {
				owner: { firstName, lastName, gender },
				brand,
				contact: { phone, whatsapp }
			} = seller

			// Add jwt token
			token.set(res, seller._id)

			res.json({
				firstName,
				lastName,
				gender,
				brandName: brand.name,
				phone,
				whatsapp
			})
		} else {
			throw new CreateHttpError[401]('Invalid Credentials')
		}
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
