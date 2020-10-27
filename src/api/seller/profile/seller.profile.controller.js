import CreateHttpError from 'http-errors'

import { token } from '../../../util'
import {
	findSeller,
	updateContactInformation,
	updateBusinessInformation
} from './seller.profile.dao'

export const getProfileInformation = async (req, res, next) => {
	try {
		const {
			owner: { firstName, lastName },
			businessName,
			businessCategory,
			brand,
			contact,
			apartments
		} = await findSeller(token.get(req))

		delete contact.pushTokens
		res.json({
			firstName,
			lastName,
			businessName,
			businessCategory,
			brand,
			contact,
			apartments
		})
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getContactInformation = async (req, res, next) => {
	try {
		const seller = await findSeller(token.get(req))
		res.json(seller.contact)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchContactInformation = async (req, res, next) => {
	const { email, phone, whatsapp, address = {} } = req.body
	try {
		const { building, street, city, area, state, pincode } = address
		const contact = await updateContactInformation(token.get(req), {
			email,
			phone,
			whatsapp,
			building,
			street,
			city,
			area,
			state,
			pincode
		})

		res.json(contact)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getBusinessInformation = async (req, res, next) => {
	try {
		const { businessName, businessCategory, owner, brand } = await findSeller(
			token.get(req)
		)
		res.json({ businessName, businessCategory, owner, brand })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

/* Could be expanded to accomodate update of other business information */
export const patchBusinessInformation = async (req, res, next) => {
	const { brandName, tagline, imageUrl } = req.body
	try {
		const contact = await updateBusinessInformation(token.get(req), {
			brandName,
			tagline,
			imageUrl
		})

		res.json(contact)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
