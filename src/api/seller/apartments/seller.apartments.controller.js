import CreateHttpError from 'http-errors'
import { token, notifications } from '../../../util'
import {
	findApartments,
	addApartment,
	updateApartmentLiveStatus,
	updateApartmentDeliverySchedule,
	updateApartmentContactInformation,
	removeApartment
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
		const [apartment, seller] = await addApartment(token.get(req), {
			apartmentId,
			phone,
			whatsapp,
			email,
			deliveryType,
			day
		})

		// Send notification to all users in apartment
		if (seller.live) {
			notifications.sendToTopic(
				`${apartmentId}_users`,
				'Merchant Added',
				`${seller.brand.name} is now servicing your apartment. Check out it's extensive catalog to buy interesting products`
			)
		}

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
	const { apartmentId, deliveryType, day, slot } = req.body
	try {
		const apartment = await updateApartmentDeliverySchedule(token.get(req), {
			apartmentId,
			deliveryType,
			day,
			slot
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

export const deleteApartment = async (req, res, next) => {
	try {
		await removeApartment(token.get(req), req.params.apartmentId)

		res.status(204).json()
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
