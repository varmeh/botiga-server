import CreateHttpError from 'http-errors'

import { token } from '../../../util'
import { findSeller, updateContactInformation } from './seller.profile.dao'

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
