import CreateHttpError from 'http-errors'
import { winston } from '../../../util'
import { Order, Seller, User } from '../../../models'

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

export const findCategoryProducts = async sellerId => {
	try {
		const seller = await Seller.findById(sellerId)
		if (!seller) {
			return Promise.reject(new CreateHttpError[404]('Seller Not Found'))
		}

		return seller.categories
	} catch (error) {
		winston.debug('@error findCategoryProducts', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}
