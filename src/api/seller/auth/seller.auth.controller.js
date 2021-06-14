import CreateHttpError from 'http-errors'

import { token, otp, aws, controllerErroHandler } from '../../../util'
import {
	createSeller,
	findSellerByNumber,
	updateToken
} from './seller.auth.dao'

const JwtTokenExpiryAfterDays = process.env.NODE_ENV === 'production' ? 90 : 5 // 90 days for Prod, 5 days for dev

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
				createToken: token.generateToken(phone, JwtTokenExpiryAfterDays)
			})
		}

		// Else, signIn seller
		const {
			owner: { firstName, lastName },
			brand,
			contact
		} = seller

		// Add jwt token
		token.set(res, seller._id, JwtTokenExpiryAfterDays)

		return res.json({
			firstName,
			lastName,
			brandName: brand.name,
			phone: contact.phone,
			whatsapp: contact.whatsapp
		})
	} catch (error) {
		return controllerErroHandler(error, next)
	}
}

export const postSellerSignup = async (req, res, next) => {
	const {
		businessName,
		firstName,
		lastName,
		brandName,
		businessCategory,
		businessType,
		gstin,
		fssaiNumber,
		fssaiValidityDate,
		fssaiCertificateUrl,
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
			businessType,
			gstin,
			fssaiNumber,
			fssaiValidityDate,
			fssaiCertificateUrl,
			brandUrl,
			tagline,
			phone
		})

		// Add jwt token
		token.set(res, seller._id, JwtTokenExpiryAfterDays)

		// Notify team about new seller onboarding
		aws.ses.sendMail({
			from: 'support@botiga.app',
			to: 'support@botiga.app',
			subject: `New seller signup - success - ${brandName}`,
			text: `Phone - ${phone}<br>Name - ${firstName} ${lastName}<br>Seller - ${businessName}<br>Category - ${businessCategory}<br>Brand - ${brandName}`
		})

		res.status(201).json({ id: seller._id })
	} catch (error) {
		aws.ses.sendMail({
			from: 'support@botiga.app',
			to: 'support@botiga.app',
			subject: `New seller signup - failure - ${brandName}`,
			text: `Phone - ${phone}<br>Name - ${firstName} ${lastName}<br>Seller - ${businessName}<br>Category - ${businessCategory}<br>Brand - ${brandName}`
		})

		controllerErroHandler(error, next)
	}
}

export const postSellerSignout = (_, res, next) => {
	try {
		// TODO: Invalidate token on signout
		res.status(204).json()
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const patchPushToken = async (req, res, next) => {
	try {
		const message = await updateToken(token.get(req), req.body.token)

		res.json({ message })
	} catch (error) {
		controllerErroHandler(error, next)
	}
}
