import CreateHttpError from 'http-errors'
import { winston } from '../../util'
import { Apartment, Seller, Order, User } from '../../models'

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

export const createOrder = async ({
	userId,
	sellerId,
	brandName,
	sellerContact: { phone, whatsapp, email },
	totalAmount,
	products
}) => {
	try {
		const user = await User.findById(userId)
		if (!user) {
			return Promise.reject(new CreateHttpError[404]('User Not Found'))
		}

		const order = new Order({
			buyer: {
				id: userId,
				name: user.name,
				deliveryAddress: user.deliveryAddress,
				phone: user.phone,
				email: user.email,
				pushToken: user.pushToken
			},
			seller: {
				// seller contact information would be specific to user
				id: sellerId,
				brandName,
				phone,
				whatsapp,
				email
			},
			order: {
				status: 'open',
				totalAmount,
				products
			}
		})

		return await order.save()
	} catch (error) {
		winston.debug('@error createOrder', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}
