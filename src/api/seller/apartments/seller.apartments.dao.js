import CreateHttpError from 'http-errors'

import { dbErrorHandler } from '../../../util'
import { Seller, Apartment, DeliveryType } from '../../../models'

export const findApartments = async sellerId => {
	try {
		return await Seller.findById(sellerId, 'apartments')
	} catch (error) {
		return dbErrorHandler(error, 'findApartments')
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
		return dbErrorHandler(error, 'updateApartmentLiveStatus')
	}
}

export const updateApartmentDeliverySchedule = async (
	sellerId,
	{
		apartmentId,
		deliveryType,
		day,
		slot,
		weekly: { sun, mon, tue, wed, thu, fri, sat }
	}
) => {
	try {
		const seller = await Seller.findById(sellerId)

		const apartment = await Apartment.findById(apartmentId)

		const sellerInApartmentSchema = apartment.sellers.id(sellerId)

		sellerInApartmentSchema.delivery.type = deliveryType
		sellerInApartmentSchema.delivery.slot = slot

		if (deliveryType === DeliveryType.weeklySchedule) {
			// If weeklySchedule not defined, define it as an empty array
			if (!sellerInApartmentSchema.delivery.weeklySchedule)
				sellerInApartmentSchema.delivery.weeklySchedule = []

			sellerInApartmentSchema.delivery.weeklySchedule = [
				sun,
				mon,
				tue,
				wed,
				thu,
				fri,
				sat
			]
			apartment.markModified('delivery.weekSchedule') //essential, else data is not saved to db
		} else {
			sellerInApartmentSchema.delivery.day = day
		}

		await apartment.save()

		seller.apartments.id(apartmentId).deliveryMessage =
			apartment.sellers.id(sellerId).deliveryMessage

		seller.apartments.id(apartmentId).deliverySlot = slot

		const updatedSeller = await seller.save()

		return updatedSeller.apartments.id(apartmentId)
	} catch (error) {
		return dbErrorHandler(error, 'updateApartmentDeliverySchedule')
	}
}

export const updateApartmentContactInformation = async (
	sellerId,
	{ apartmentId, phone, whatsapp, email }
) => {
	try {
		const seller = await Seller.findById(sellerId)

		const apartment = await Apartment.findById(apartmentId)

		const sellerInApartmentSchema = apartment.sellers.id(sellerId)

		sellerInApartmentSchema.contact.phone = phone
		sellerInApartmentSchema.contact.whatsapp = whatsapp
		sellerInApartmentSchema.contact.email = email

		await apartment.save()

		seller.apartments.id(apartmentId).contact =
			apartment.sellers.id(sellerId).contact

		const updatedSeller = await seller.save()

		return updatedSeller.apartments.id(apartmentId)
	} catch (error) {
		return dbErrorHandler(error, 'updateApartmentContactInformation')
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
		return dbErrorHandler(error, 'removeApartment')
	}
}
