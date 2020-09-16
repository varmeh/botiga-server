import CreateHttpError from 'http-errors'
import { token } from '../../../util'
import { findApartments, addApartment } from './seller.apartments.dao'

export const getApartments = async (req, res, next) => {
	try {
		const apartments = await findApartments(token.get(req))

		res.json(apartments)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postApartments = async (req, res, next) => {
	const { apartmentId, phone, whatsapp, deliveryType, day } = req.body
	try {
		const apartment = await addApartment(token.get(req), {
			apartmentId,
			phone,
			whatsapp,
			deliveryType,
			day
		})
		res.json(apartment)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
