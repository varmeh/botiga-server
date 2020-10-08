import CreateHttpError from 'http-errors'
import { winston } from '../../../util'
import { Order, Seller, User } from '../../../models'

export const createOrder = async ({
	userId,
	sellerId,
	deliveryDate,
	sellerContact, // has phone, email & whatsapp of apartment manager
	totalAmount,
	products
}) => {
	try {
		const user = await User.findById(userId)
		if (!user) {
			return Promise.reject(new CreateHttpError[404]('User Not Found'))
		}

		const seller = await Seller.findById(sellerId)
		if (!seller) {
			return Promise.reject(new CreateHttpError[404]('Seller Not Found'))
		}

		const { phone, whatsapp, email, address, pushToken } = user.contact

		const order = new Order({
			apartment: {
				id: address[0].aptId,
				aptName: address[0].aptName,
				area: address[0].area,
				city: address[0].city,
				state: address[0].state,
				pincode: address[0].pincode
			},
			buyer: {
				id: userId,
				name: user.name,
				house: address[0].house,
				phone,
				whatsapp,
				email,
				pushToken
			},
			seller: {
				// seller contact information would be specific to user
				id: sellerId,
				brandName: seller.brand.name,
				phone: sellerContact.phone,
				whatsapp: sellerContact.whatsapp,
				email: sellerContact.email,
				pushToken: seller.pushToken
			},
			order: {
				status: 'open',
				totalAmount,
				expectedDeliveryDate: deliveryDate,
				products
			}
		})

		return await order.save()
	} catch (error) {
		winston.debug('@error createOrder', { error, msg: error.message })
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
		winston.debug('@error findCategoryProducts', {
			error,
			msg: error.message
		})
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findOrderById = async orderId => {
	try {
		const order = await Order.findById(orderId)
		if (!order) {
			return Promise.reject(new CreateHttpError[404]('Order Not Found'))
		}

		return order
	} catch (error) {
		winston.debug('@error findOrder', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findOrders = async ({ userId, skip, limit }) => {
	try {
		const query = { 'buyer.id': userId }

		// TODO: validate sort method implementation
		const orders = await Order.find(query)
			.sort({
				createdAt: -1
			})
			.skip(skip)
			.limit(limit)

		const count = await Order.find(query).count()

		return [count, orders]
	} catch (error) {
		winston.debug('@error findOrder', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}
