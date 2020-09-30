import CreateHttpError from 'http-errors'

import { password, token, otp } from '../../../util'
import {
	createSeller,
	findSellerByNumber,
	updateSellerPin
} from './seller.auth.dao'

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
		phone
	} = req.body

	try {
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

export const postSellerLoginWithPin = async (req, res, next) => {
	const { phone, pin } = req.body

	try {
		const seller = await findSellerByNumber(phone)
		if (!seller) {
			throw new CreateHttpError[404]('Seller Not Found')
		}
		const match = await password.compare(pin, seller.loginPin)

		if (match) {
			// remove seller pin before sending seller information to frontend
			const {
				owner: { firstName, lastName },
				brand,
				contact: { phone, whatsapp }
			} = seller

			// Add jwt token
			token.set(res, seller._id)

			res.json({
				firstName,
				lastName,
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

export const patchUserPin = async (req, res, next) => {
	try {
		const hashedPin = await password.hash(req.body.pin)

		await updateSellerPin(token.get(req), hashedPin)
		res.json({
			message: 'pin updated'
		})
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
