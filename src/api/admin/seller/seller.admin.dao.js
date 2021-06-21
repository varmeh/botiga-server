/* eslint-disable no-undefined */
import CreateHttpError from 'http-errors'
import { moment, dbErrorHandler } from '../../../util'
import {
	Apartment,
	Seller,
	Order,
	DeliveryType,
	PaymentStatus
} from '../../../models'

export const findApartment = async apartmentId => {
	try {
		const apartments = await Apartment.find(
			{ _id: apartmentId },
			{
				name: 1,
				area: 1,
				city: 1,
				state: 1,
				pincode: 1,
				banners: 1,
				sellers: 1,
				marketingBanners: 1
			}
		)
		if (apartments.length === 0) {
			return Promise.reject(new CreateHttpError[404]('Apartment not found'))
		}
		return apartments[0]
	} catch (error) {
		return dbErrorHandler(error, 'findApartment')
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
		return dbErrorHandler(error, 'findSellerByNumber')
	}
}

export const findApprovedSellers = async () => {
	try {
		return await Seller.find({ 'bankDetails.verified': true })
	} catch (error) {
		return dbErrorHandler(error, 'findSellerByNumber')
	}
}

export const updateSellerFilters = async (phone, filters) => {
	try {
		const seller = await findSellerByNumber(phone)

		// Iterate over seller apartments & add filters one by one
		for (const apt of seller.apartments) {
			const apartment = await findApartment(apt._id)
			apartment.sellers.id(seller._id).filters = filters
			await apartment.save()
		}

		seller.filters = filters
		const updatedSeller = await seller.save()

		return updatedSeller
	} catch (error) {
		return dbErrorHandler(error, 'updateSellerFilters')
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
		return dbErrorHandler(error, 'updateSellerBankDetails')
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
			'apartment.id': apartmentId,
			'payment.status': PaymentStatus.success
		}

		const deliveries = await Order.find(query).sort({
			createdAt: 1
		})

		const count = await Order.find(query).countDocuments()

		return [count, deliveries]
	} catch (error) {
		return dbErrorHandler(error, 'findDeliveriesByApartment')
	}
}

export const findDeliveriesForSeller = async ({ sellerPhone, dateString }) => {
	try {
		const seller = await findSellerByNumber(sellerPhone)

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
		return dbErrorHandler(error, 'findDeliveriesForSeller')
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
			contact: { address, whatsapp, email },
			filters
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
			delivery: { type: 'duration', day: 3 },
			filters
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
		return dbErrorHandler(error, 'addSellerApartment')
	}
}

export const addSellerConfigureApartment = async data => {
	try {
		const {
			phone,
			apartmentId,
			deliveryType,
			day,
			slot,
			weekly: { sun, mon, tue, wed, thu, fri, sat },
			deliveryMinOrder,
			deliveryFee
		} = data
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
			contact: { address, whatsapp, email },
			filters
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
			filters,
			delivery: {
				type: deliveryType,
				day,
				weeklySchedule: [sun, mon, tue, wed, thu, fri, sat],
				slot,
				minOrder: deliveryMinOrder,
				fee: deliveryFee
			}
		})

		const updatedApartment = await apartment.save()

		// Add apartment information to seller list
		seller.apartments.push({
			_id: apartmentId,
			apartmentName: apartment.name,
			apartmentArea: apartment.area,
			live: false,
			contact: { phone, whatsapp, email },
			deliveryMessage: updatedApartment.sellers.id(seller._id).deliveryMessage,
			deliverySlot: slot,
			deliveryMinOrder,
			deliveryFee
		})

		const updatedSeller = await seller.save()

		return [updatedSeller.apartments.id(apartmentId), updatedSeller]
	} catch (error) {
		return dbErrorHandler(error, 'addSellerApartment')
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
		return dbErrorHandler(error, 'updateApartmentLiveStatus')
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
		return dbErrorHandler(error, 'removeSellerApartment')
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
		return dbErrorHandler(error, 'removeSellerAllApartments')
	}
}

export const updateApartmentDeliveryFee = async ({
	phone,
	apartmentId,
	deliveryMinOrder,
	deliveryFee
}) => {
	try {
		const seller = await findSellerByNumber(phone)

		// Update Apartment Document with seller fee data
		const apartment = await Apartment.findById(apartmentId)
		const sellerInApartmentSchema = apartment.sellers.id(seller._id)

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

export const updateApartmentDeliverySchedule = async ({
	phone,
	apartmentId,
	deliveryType,
	day,
	slot,
	weekly: { sun, mon, tue, wed, thu, fri, sat }
}) => {
	try {
		const seller = await findSellerByNumber(phone)

		// Update Apartment Document with seller fee data
		const apartment = await Apartment.findById(apartmentId)
		const sellerInApartmentSchema = apartment.sellers.id(seller._id)

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

		// Update Seller Document
		const apartmentInSellerSchema = seller.apartments.id(apartmentId)
		apartmentInSellerSchema.deliveryMessage = apartment.sellers.id(
			seller._id
		).deliveryMessage
		apartmentInSellerSchema.deliverySlot = slot

		const updatedSeller = await seller.save()

		return updatedSeller.apartments.id(apartmentId)
	} catch (error) {
		return dbErrorHandler(error, 'updateApartmentDeliveryFee')
	}
}

export const updateNotification = async ({
	phone,
	title,
	content,
	imageUrl
}) => {
	try {
		const seller = await findSellerByNumber(phone)

		seller.notification = { title, content, imageUrl }

		const updatedSeller = await seller.save()

		return updatedSeller
	} catch (error) {
		return dbErrorHandler(error, 'updateSellerFilters')
	}
}
