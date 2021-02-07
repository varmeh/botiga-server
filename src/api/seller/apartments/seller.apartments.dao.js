import CreateHttpError from 'http-errors'

import { winston } from '../../../util'
import { Seller, Apartment } from '../../../models'

const logDbError = error => ({ error, msg: error?.message })
const promiseRejectServerError = error => {
	const { status, message } = error
	return Promise.reject(new CreateHttpError[status ?? 500](message))
}

export const findApartments = async sellerId => {
	try {
		return await Seller.findById(sellerId, 'apartments')
	} catch (error) {
		winston.debug('@error findApartments', logDbError(error))
		return promiseRejectServerError(error)
	}
}

/*
 * Updating an apartment schedule needs updates in 2 models:
 *	- Seller Model -> apartments array
 * 	- Apartment Model -> sellers array
 *
 * So, this would be achieved using Mongodb Transaction
 */
export const updateApartmentLiveStatus = async (
	sellerId,
	{ apartmentId, live }
) => {
	try {
		const seller = await Seller.findById(sellerId)

		// Check if seller has account has been verified
		if (!seller.bankDetailsVerified) {
			throw new CreateHttpError[401](
				'Bank Details Not Verified. Contact Botiga customer care'
			)
		}
		// If either seller or apartment does not exist, accessing their information will cause internal server error
		const apartment = await Apartment.findById(apartmentId)
		apartment.sellers.id(sellerId).live = live
		await apartment.save()

		seller.apartments.id(apartmentId).live = live
		const updatedSeller = await seller.save()

		return updatedSeller.apartments.id(apartmentId)
	} catch (error) {
		winston.debug('@error updateApartmentLiveStatus', logDbError(error))
		return promiseRejectServerError(error)
	}
}

export const updateApartmentDeliverySchedule = async (
	sellerId,
	{ apartmentId, deliveryType, day, slot }
) => {
	try {
		const seller = await Seller.findById(sellerId)

		const apartment = await Apartment.findById(apartmentId)

		apartment.sellers.id(sellerId).delivery = { type: deliveryType, day, slot }

		await apartment.save()

		seller.apartments.id(apartmentId).deliveryMessage = apartment.sellers.id(
			sellerId
		).deliveryMessage

		seller.apartments.id(apartmentId).deliverySlot = slot

		const updatedSeller = await seller.save()

		return updatedSeller.apartments.id(apartmentId)
	} catch (error) {
		winston.debug('@error updateApartmentDeliverySchedule', logDbError(error))
		return promiseRejectServerError(error)
	}
}

export const updateApartmentContactInformation = async (
	sellerId,
	{ apartmentId, phone, whatsapp, email }
) => {
	try {
		const seller = await Seller.findById(sellerId)

		const apartment = await Apartment.findById(apartmentId)

		apartment.sellers.id(sellerId).contact = { phone, whatsapp, email }

		await apartment.save()

		seller.apartments.id(apartmentId).contact = apartment.sellers.id(
			sellerId
		).contact

		const updatedSeller = await seller.save()

		return updatedSeller.apartments.id(apartmentId)
	} catch (error) {
		winston.debug('@error updateApartmentContactInformation', logDbError(error))
		return promiseRejectServerError(error)
	}
}

export const removeApartment = async (sellerId, apartmentId) => {
	try {
		const seller = await Seller.findById(sellerId)
		const apartment = await Apartment.findById(apartmentId)

		const sellerToBeRemoved = apartment.sellers.id(sellerId)
		if (sellerToBeRemoved) {
			// Remove seller from apartment
			sellerToBeRemoved.remove()
			await apartment.save()
		}

		const apartmentToBeRemoved = seller.apartments.id(apartmentId)
		if (apartmentToBeRemoved) {
			apartmentToBeRemoved.remove()
			await seller.save()
		}

		return 'Apartment removed'
	} catch (error) {
		winston.debug('@error removeApartment', logDbError(error))
		return promiseRejectServerError(error)
	}
}
