/* eslint-disable no-undefined */
import CreateHttpError from 'http-errors'
import { winston, moment } from '../../util'
import { Apartment, Seller, Order } from '../../models'

export const createApartment = async ({
	name,
	area,
	city,
	state,
	pincode,
	location: { lat, long }
}) => {
	try {
		const apartment = new Apartment({
			name,
			area,
			city,
			state,
			pincode,
			location: { type: 'Point', coordinates: [long, lat] }
		})
		return await apartment.save()
	} catch (error) {
		winston.debug('@error createApartment', { error })
		if (error.code === 11000) {
			// Apartment in area already exists
			return Promise.reject(
				new CreateHttpError[409]('Apartment already exists')
			)
		}

		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findSellerByNumber = async phone => {
	try {
		const seller = await Seller.findOne({ 'contact.phone': phone })
		if (!seller) {
			return Promise.reject(new CreateHttpError[404]('Seller not found'))
		}

		return seller
	} catch (error) {
		winston.debug('@error findSellerByNumber', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const updateSellerBankDetails = async ({
	phone,
	editable,
	verified,
	mid
}) => {
	try {
		const seller = await findSellerByNumber(phone)

		const { bankDetails } = seller

		seller.mid = !mid ? seller.mid : mid
		bankDetails.editable =
			editable !== undefined ? editable : bankDetails.editable
		bankDetails.verified =
			verified !== undefined ? verified : bankDetails.verified

		return await seller.save()
	} catch (error) {
		winston.debug('@error updateSellerBankDetails', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findDeliveriesByApartment = async ({
	sellerId,
	apartmentId,
	dateString
}) => {
	try {
		const date = moment(dateString, 'YYYY-MM-DD').startOf('day')

		const query = {
			'order.expectedDeliveryDate': {
				$gte: date.toDate(),
				$lte: moment(date).endOf('day').toDate()
			},
			'seller.id': sellerId,
			'apartment.id': apartmentId
		}

		const deliveries = await Order.find(query, {
			buyer: 1,
			order: 1,
			createdAt: 1
		}).sort({
			createdAt: 1
		})

		const count = await Order.find(query).countDocuments()

		return [count, deliveries]
	} catch (error) {
		winston.debug('@error findDeliveriesByApartment', {
			error,
			msg: error.message
		})
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findDeliveriesForSeller = async ({ sellerPhone, dateString }) => {
	try {
		const seller = await Seller.findOne({ 'contact.phone': sellerPhone })
		if (!seller) {
			return Promise.reject(new CreateHttpError[404]('Seller not found'))
		}

		const deliveries = []
		for (const apartment of seller.apartments) {
			const [count, deliveryByApartment] = await findDeliveriesByApartment({
				sellerId: seller._id,
				apartmentId: apartment._id,
				dateString
			})
			if (count > 0) {
				deliveries.push({ count, apartment, deliveries: deliveryByApartment })
			}
		}

		return deliveries
	} catch (error) {
		winston.debug('@error findDeliveriesForSeller', {
			error,
			msg: error.message
		})
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const removeSellerApartment = async (phone, apartmentId) => {
	try {
		const seller = await findSellerByNumber(phone)
		const apartment = await Apartment.findById(apartmentId)

		const sellerToBeRemoved = apartment.sellers.id(seller.id)
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
		return 'removed'
	} catch (error) {
		winston.debug('@error removeSellerApartment', {
			error,
			msg: error.message,
			phone,
			apartmentId
		})
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const removeSellerAllApartments = async phone => {
	try {
		const seller = await findSellerByNumber(phone)

		const apartmentIdList = []

		seller.apartments.forEach(apartment => apartmentIdList.push(apartment._id))

		// Don't use map or forEach to avoid complication - https://zellwk.com/blog/async-await-in-loops/#:~:text=If%20you%20use%20await%20in,asynchronous%20functions%20always%20return%20promises.&text=Since%20map%20always%20return%20promises,do%20this%20with%20await%20Promise.
		for (let i = 0; i < apartmentIdList.length; i++) {
			await removeSellerApartment(phone, apartmentIdList[i])
		}
		return 'removed'
	} catch (error) {
		winston.debug('@error removeSellerAllApartments', {
			error,
			msg: error.message
		})
		return Promise.reject(new CreateHttpError[500]())
	}
}
