import CreateHttpError from 'http-errors'

import { dbErrorHandler } from '../../../util'
import { Seller, Apartment } from '../../../models'

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
	{ apartmentId, deliveryType, day, slot }
) => {
	try {
		const seller = await Seller.findById(sellerId)

		const apartment = await Apartment.findById(apartmentId)

		const sellerInApartmentSchema = apartment.sellers.id(sellerId)

		sellerInApartmentSchema.delivery.type = deliveryType
		sellerInApartmentSchema.delivery.day = day
		sellerInApartmentSchema.delivery.slot = slot

		await apartment.save()

		seller.apartments.id(apartmentId).deliveryMessage = apartment.sellers.id(
			sellerId
		).deliveryMessage

		seller.apartments.id(apartmentId).deliverySlot = slot

		const updatedSeller = await seller.save()

		return updatedSeller.apartments.id(apartmentId)
	} catch (error) {
		return dbErrorHandler(error, 'updateApartmentDeliverySchedule')
	}
}

export const updateApartmentDeliveryFee = async ({
	sellerId,
	apartmentId,
	deliveryMinOrder,
	deliveryFee
}) => {
	try {
		const seller = await Seller.findById(sellerId)
		if (!seller) {
			return Promise.reject(new CreateHttpError[404]('Seller not found'))
		}

		// Update Apartment Document with seller fee data
		const apartment = await Apartment.findById(apartmentId)
		const sellerInApartmentSchema = apartment.sellers.id(sellerId)

		sellerInApartmentSchema.delivery.minOrder = deliveryMinOrder
		sellerInApartmentSchema.delivery.fee = deliveryFee

		await apartment.save()

		// Update Seller Document
		const apartmentInSellerSchema = seller.apartments.id(apartmentId)
		apartmentInSellerSchema.deliveryFee = deliveryFee
		apartmentInSellerSchema.deliveryMinOrder = deliveryMinOrder

		const updatedSeller = await seller.save()

		return updatedSeller.apartments.id(apartmentId)
	} catch (error) {
		return dbErrorHandler(error, 'updateApartmentDeliveryFee')
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

		seller.apartments.id(apartmentId).contact = apartment.sellers.id(
			sellerId
		).contact

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
