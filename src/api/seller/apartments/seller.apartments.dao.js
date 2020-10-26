import CreateHttpError from 'http-errors'

import { winston } from '../../../util'
import { Seller, Apartment } from '../../../models'

const logDbError = error => ({ error, msg: error?.message })
const promiseRejectServerError = () =>
	Promise.reject(new CreateHttpError[500]())

export const findApartments = async sellerId => {
	try {
		return await Seller.findById(sellerId, 'apartments')
	} catch (error) {
		winston.debug('@error findApartments', logDbError(error))
		return promiseRejectServerError()
	}
}

/*
 * Adding a new apartment to Seller service list needs updates in 2 models:
 *	- Seller Model -> apartments array
 * 	- Apartment Model -> sellers array
 *
 * So, this would be achieved using Mongodb Transaction
 */
export const addApartment = async (
	sellerId,
	{ apartmentId, phone, whatsapp, email, deliveryType, day }
) => {
	try {
		const seller = await Seller.findById(sellerId)

		// Check if apartment already exists in seller list
		if (seller.apartments.id(apartmentId)) {
			return Promise.reject(new CreateHttpError[409]('Duplicate Apartment'))
		}

		const apartment = await Apartment.findById(apartmentId)
		// Check if it's a valid apartment id
		if (!apartment) {
			return Promise.reject(new CreateHttpError[404]('Apartment Not Found'))
		}

		// Check if seller already exists in apartment sellers list
		if (apartment.sellers.id(sellerId)) {
			return Promise.reject(new CreateHttpError[409]('Duplicate Seller'))
		}

		// Add seller information to apartment list
		const { businessCategory, brand } = seller
		const { name, tagline, imageUrl } = brand

		apartment.sellers.push({
			_id: sellerId,
			brandName: name,
			tagline,
			brandImageUrl: imageUrl,
			businessCategory,
			live: false,
			contact: { phone, whatsapp, email },
			delivery: { type: deliveryType, day }
		})

		await apartment.save()

		// Add apartment information to seller list
		seller.apartments.push({
			_id: apartmentId,
			apartmentName: apartment.name,
			apartmentArea: apartment.area,
			live: false,
			contact: { phone, whatsapp, email },
			deliveryMessage: apartment.sellers.id(sellerId).deliveryMessage
		})

		const updatedSeller = await seller.save()

		return updatedSeller.apartments.id(apartmentId)
	} catch (error) {
		winston.debug('@error addApartment', logDbError(error))
		return promiseRejectServerError()
	}
}

export const updateApartmentLiveStatus = async (
	sellerId,
	{ apartmentId, live }
) => {
	try {
		// If either seller or apartment does not exist, accessing their information will cause internal server error
		const apartment = await Apartment.findById(apartmentId)
		apartment.sellers.id(sellerId).live = live
		await apartment.save()

		const seller = await Seller.findById(sellerId)
		seller.apartments.id(apartmentId).live = live
		const updatedSeller = await seller.save()

		return updatedSeller.apartments.id(apartmentId)
	} catch (error) {
		winston.debug('@error updateApartmentLiveStatus', logDbError(error))
		return promiseRejectServerError()
	}
}
