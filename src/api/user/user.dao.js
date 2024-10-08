import CreateHttpError from 'http-errors'
import { Types } from 'mongoose'

import { dbErrorHandler } from '../../util'
import { Apartment, Seller, User } from '../../models'

export const findSellersInApartment = async apartmentId => {
	try {
		const data = await Apartment.aggregate([
			{
				$match: {
					_id: Types.ObjectId(apartmentId)
				}
			},
			{
				$project: { sellers: 1, _id: 0 }
			},
			{
				$unwind: '$sellers'
			},
			{
				$replaceWith: '$sellers'
			},
			{
				$sort: { live: -1, brandName: 1 }
			}
		])

		return data
	} catch (error) {
		return dbErrorHandler(error, 'findSellersInApartment')
	}
}

export const findApartmentInfo = async apartmentId => {
	try {
		const apartment = await Apartment.find(
			{ _id: apartmentId },
			{
				name: 1,
				area: 1,
				city: 1,
				state: 1,
				pincode: 1,
				marketingBanners: 1
			}
		)

		if (apartment.length > 0) {
			return apartment[0]
		} else {
			return Promise.reject(new CreateHttpError[404]('Apartment Not Found'))
		}
	} catch (error) {
		return dbErrorHandler(error, 'findApartmentInfo')
	}
}

export const findSeller = async sellerId => {
	try {
		const seller = await Seller.findById(sellerId)

		if (!seller) {
			return Promise.reject(new CreateHttpError[404]('Seller Not Found'))
		}

		return seller
	} catch (error) {
		return dbErrorHandler(error, 'findSeller')
	}
}

export const findCart = async (userId, addressId) => {
	try {
		const user = await User.findById(userId)
		const address = user.contact.addresses.id(addressId)
		if (!address) {
			return Promise.reject(new CreateHttpError[404]('Address Not Found'))
		}
		// save this address as last used address
		user.lastUsedAddressId = addressId
		await user.save()
		return address.cart
	} catch (error) {
		return dbErrorHandler(error, 'findCart')
	}
}

export const updateCart = async ({ userId, sellerId, addressId, products }) => {
	try {
		const user = await User.findById(userId)
		const address = user.contact.addresses.id(addressId)
		if (!address) {
			return Promise.reject(new CreateHttpError[404]('Address Not Found'))
		}
		const validSellerId = !sellerId ? null : sellerId // Valid values for an ObjectId field are null and objectId
		address.cart = { sellerId: validSellerId, products }

		return await user.save()
	} catch (error) {
		return dbErrorHandler(error, 'updateCart')
	}
}
