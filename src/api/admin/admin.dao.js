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

		const deliveries = await Order.find(query).sort({
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

		return [seller, deliveries]
	} catch (error) {
		winston.debug('@error findDeliveriesForSeller', {
			error,
			msg: error.message
		})
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const addSellerApartment = async (phone, apartmentId) => {
	try {
		const seller = await findSellerByNumber(phone)

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
		if (apartment.sellers.id(seller._id)) {
			return Promise.reject(new CreateHttpError[409]('Duplicate Seller'))
		}

		if (!seller.bankDetailsVerified) {
			return Promise.reject(
				new CreateHttpError[401](
					'Apartment can be added only after your bank detail verification has been completed'
				)
			)
		}

		// Add seller information to apartment list
		const {
			businessCategory,
			brand,
			contact: { address, whatsapp, email }
		} = seller
		const { name, tagline, imageUrl } = brand

		apartment.sellers.push({
			_id: seller._id,
			brandName: name,
			tagline,
			brandImageUrl: imageUrl,
			businessCategory,
			live: false,
			contact: {
				phone,
				whatsapp,
				email,
				address: `${address.building}, ${address.street}, ${address.area}, ${address.city}, ${address.state} - ${address.pincode}`
			},
			fssaiLicenseNumber: seller.fssai?.number,
			delivery: { type: 'day', day: 3 }
		})

		await apartment.save()

		// Add apartment information to seller list
		seller.apartments.push({
			_id: apartmentId,
			apartmentName: apartment.name,
			apartmentArea: apartment.area,
			live: false,
			contact: { phone, whatsapp, email },
			deliveryMessage: apartment.sellers.id(seller._id).deliveryMessage
		})

		const updatedSeller = await seller.save()

		return [updatedSeller.apartments.id(apartmentId), updatedSeller]
	} catch (error) {
		winston.debug('@error addApartment', { error, msg: error?.message })
		const { status, message } = error
		return Promise.reject(new CreateHttpError[status ?? 500](message))
	}
}

export const updateApartmentLiveStatus = async (phone, apartmentId, live) => {
	try {
		const seller = await findSellerByNumber(phone)

		// Check if seller has account has been verified
		if (!seller.bankDetailsVerified) {
			throw new CreateHttpError[401](
				'Bank Details Not Verified. Contact Botiga customer care'
			)
		}

		// If either seller or apartment does not exist, accessing their information will cause internal server error
		const apartment = await Apartment.findById(apartmentId)
		apartment.sellers.id(seller._id).live = live
		await apartment.save()

		seller.apartments.id(apartmentId).live = live
		const updatedSeller = await seller.save()

		return updatedSeller.apartments.id(apartmentId)
	} catch (error) {
		winston.debug('@error updateApartmentLiveStatus', {
			error,
			msg: error?.message
		})
		const { status, message } = error
		return Promise.reject(new CreateHttpError[status ?? 500](message))
	}
}

export const removeSellerApartment = async (phone, apartmentId) => {
	try {
		const seller = await findSellerByNumber(phone)
		const apartment = await Apartment.findById(apartmentId)

		// Remove seller from apartment document
		const sellerToBeRemoved = apartment.sellers.id(seller.id)
		if (sellerToBeRemoved) {
			sellerToBeRemoved.remove()
			await apartment.save()
		}

		// Remove apartment from seller document
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
