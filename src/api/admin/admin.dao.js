import CreateHttpError from 'http-errors'
import { winston, crypto, moment } from '../../util'
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

const sellerOrchestrator = seller => {
	const {
		businessName,
		businessCategory,
		owner: { firstName, lastName },
		brand: { name, tagline, imageUrl },
		contact: { phone, whatsapp, email },
		bankDetails
	} = seller

	let returnBankDetails = {}
	if (seller.bankDetails.beneficiaryName) {
		// Seller bank details available
		const {
			editable,
			verified,
			beneficiaryName,
			accountNumber,
			ifscCode,
			bankName,
			accountType
		} = bankDetails

		returnBankDetails = {
			editable,
			verified,
			beneficiaryName: crypto.decryptString(beneficiaryName),
			accountNumber: crypto.decryptString(accountNumber),
			ifscCode,
			bankName,
			accountType
		}
	}

	return {
		businessName,
		businessCategory,
		owner: `${firstName} ${lastName}`,
		brand: name,
		tagline,
		brandImageUrl: imageUrl,
		phone,
		whatsapp,
		email,
		...returnBankDetails,
		mid: seller.mid
	}
}
export const findSellerByNumber = async phone => {
	try {
		const seller = await Seller.findOne({ 'contact.phone': phone })
		if (!seller) {
			return Promise.reject(new CreateHttpError[404]('Seller not found'))
		}

		return sellerOrchestrator(seller)
	} catch (error) {
		winston.debug('@error findSellerByNumber', { error })
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
