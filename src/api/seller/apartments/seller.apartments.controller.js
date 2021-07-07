import { token, controllerErroHandler } from '../../../util'
import {
	findApartments,
	updateApartmentLiveStatus,
	updateAllApartmentsLiveStatus,
	updateApartmentDeliverySchedule,
	updateApartmentContactInformation,
	removeApartment
} from './seller.apartments.dao'

export const getApartments = async (req, res, next) => {
	try {
		const apartments = await findApartments(token.get(req))

		res.json(apartments)
	} catch (error) {
		controllerErroHandler(error, next)
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
		controllerErroHandler(error, next)
	}
}

export const patchAllApartmentsLive = async (req, res, next) => {
	try {
		const apartments = await updateAllApartmentsLiveStatus(
			token.get(req),
			req.body.live
		)
		res.json(apartments)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const patchDelierySchedule = async (req, res, next) => {
	const { apartmentId, deliveryType, day, slot, weekly } = req.body
	try {
		const apartment = await updateApartmentDeliverySchedule(token.get(req), {
			apartmentId,
			deliveryType,
			day,
			slot,
			weekly
		})
		res.json(apartment)
	} catch (error) {
		controllerErroHandler(error, next)
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
		controllerErroHandler(error, next)
	}
}

export const deleteApartment = async (req, res, next) => {
	try {
		await removeApartment(token.get(req), req.params.apartmentId)

		res.status(204).json()
	} catch (error) {
		controllerErroHandler(error, next)
	}
}
