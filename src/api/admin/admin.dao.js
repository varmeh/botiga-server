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

export const findSellerByNumber = async phone => {
	try {
		return await Seller.findOne({ 'contact.phone': phone })
	} catch (error) {
		winston.debug('@error findSellerByNumber', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findSellerBankDetails = async phone => {
	try {
		const seller = await findSellerByNumber(phone)

		if (!seller) {
			return Promise.reject(new CreateHttpError[404]('Seller not found'))
		}

		if (!seller.bankDetails.beneficiaryName) {
			return Promise.reject(
				new CreateHttpError[404]('Bank Details not available')
			)
		}

		const {
			editable,
			beneficiaryName,
			accountNumber,
			ifscCode,
			bankName,
			accountType
		} = seller.bankDetails

		return {
			editable,
			beneficiaryName: crypto.decryptString(beneficiaryName),
			accountNumber: crypto.decryptString(accountNumber),
			ifscCode,
			bankName,
			accountType
		}
	} catch (error) {
		winston.debug('@error findSellerBankDetails', { error })
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
