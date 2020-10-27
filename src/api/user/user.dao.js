import CreateHttpError from 'http-errors'
import { winston } from '../../util'
import { Apartment, Seller, User } from '../../models'

export const findSellersInApartment = async apartmentId => {
	try {
		const apartment = await Apartment.findById(apartmentId)

		if (!apartment) {
			return Promise.reject(new CreateHttpError[404]('Apartment Not Found'))
		}

		return apartment.sellers
	} catch (error) {
		winston.debug('@error findSellersInApartment', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findProductsBySeller = async sellerId => {
	try {
		const seller = await Seller.findById(sellerId)

		if (!seller) {
			return Promise.reject(new CreateHttpError[404]('Seller Not Found'))
		}

		return seller.categories
	} catch (error) {
		winston.debug('@error findProductsBySeller', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findCart = async userId => {
	try {
		const user = await User.findById(userId)
		return user.cart
	} catch (error) {
		winston.debug('@error findCart', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const updateCart = async ({
	userId,
	sellerId,
	totalAmount,
	products
}) => {
	try {
		const user = await User.findById(userId)
		user.cart = { sellerId, totalAmount, products }

		return await user.save()
	} catch (error) {
		winston.debug('@error updateCart', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}
