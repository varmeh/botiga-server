import CreateHttpError from 'http-errors'
import { token } from '../../../util'
import {
	findApartments,
	addApartment,
	updateApartmentLiveStatus,
	updateApartmentDeliverySchedule,
	updateApartmentContactInformation
} from './seller.apartments.dao'

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
	const { apartmentId, phone, whatsapp, email, deliveryType, day } = req.body
	try {
		const apartment = await addApartment(token.get(req), {
			apartmentId,
			phone,
			whatsapp,
			email,
			deliveryType,
			day
		})
		res.json(apartment)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchApartmentLive = async (req, res, next) => {
	const { apartmentId, live } = req.body

	try {
		const apartment = await updateApartmentLiveStatus(token.get(req), {
			apartmentId,
			live
		})
		res.json(apartment)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchDelierySchedule = async (req, res, next) => {
	const { apartmentId, deliveryType, day } = req.body
	try {
		const apartment = await updateApartmentDeliverySchedule(token.get(req), {
			apartmentId,
			deliveryType,
			day
		})
		res.json(apartment)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchContactInformation = async (req, res, next) => {
	const { apartmentId, phone, whatsapp, email } = req.body
	try {
		const apartment = await updateApartmentContactInformation(token.get(req), {
			apartmentId,
			phone,
			whatsapp,
			email
		})
		res.json(apartment)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
