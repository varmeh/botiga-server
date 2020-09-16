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
 * This is a one time activity
 * Once added to seller list, no updates are required ever in this information
 * As the following information added here is immutable:
 * 	- apartment _id
 * 	- apartment name
 *  - apartment area
 */
export const addApartment = async (sellerId, apartmentId) => {
	try {
		const seller = await Seller.findById(sellerId)

		// Check if apartment already exists in seller list
		if (seller.apartments.id(apartmentId)) {
			return Promise.reject(new CreateHttpError[409]('Duplicate Apartment'))
		}

		// Fetch apartment information from Apartment model
		const apartment = await Apartment.findById(apartmentId)
		if (!apartment) {
			return Promise.reject(new CreateHttpError[404]('Apartment Not Found'))
		}

		seller.apartments.push({
			_id: apartmentId,
			apartmentName: apartment.name,
			apartmentArea: apartment.area,
			live: false
		})

		const updatedSeller = await seller.save()
		return updatedSeller.apartments.id(apartmentId)
	} catch (error) {
		winston.debug('@error findApartments', logDbError(error))
		return promiseRejectServerError()
	}
}
