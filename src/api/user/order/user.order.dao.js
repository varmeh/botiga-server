import CreateHttpError from 'http-errors'
import chance from 'chance'
import { winston, moment } from '../../../util'

import {
	Order,
	Seller,
	User,
	Apartment,
	OrderStatus,
	PaymentStatus
} from '../../../models'

export const createOrder = async ({
	userId,
	sellerId,
	house,
	apartmentId,
	totalAmount,
	products
}) => {
	try {
		const user = await User.findById(userId)
		if (!user) {
			return Promise.reject(new CreateHttpError[404]('User Not Found'))
		}

		const apartment = await Apartment.findById(apartmentId)
		if (!apartment) {
			return Promise.reject(new CreateHttpError[404]('Apartment Not Found'))
		}

		const seller = apartment.sellers.id(sellerId)
		if (!seller) {
			return Promise.reject(new CreateHttpError[404]('Seller Not Found'))
		}
		const order = new Order({
			apartment: {
				id: apartment._id,
				aptName: apartment.name,
				area: apartment.area,
				city: apartment.city,
				state: apartment.state,
				pincode: apartment.pincode
			},
			buyer: {
				id: userId,
				name: user.name,
				house,
				phone: user.contact.phone,
				whatsapp: user.contact.whatsapp,
				email: user.contact.email
			},
			seller: {
				// seller contact information would be specific to user
				id: sellerId,
				brandName: seller.brandName,
				phone: seller.contact.phone,
				whatsapp: seller.contact.whatsapp,
				email: seller.contact.email
			},
			order: {
				number: chance().integer({ min: 100000, max: 999999 }),
				status: 'open',
				totalAmount,
				expectedDeliveryDate: seller.deliveryDate,
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

export const cancelOrder = async (orderId, userId) => {
	try {
		const order = await Order.findOne({ _id: orderId, 'buyer.id': userId })
		if (!order) {
			return Promise.reject(new CreateHttpError[404]('Order Not Found'))
		}

		order.order.status = OrderStatus.cancelled
		order.order.completionDate = moment().toDate()

		// Refund Initiated
		if (order.payment.status === PaymentStatus.success) {
			order.refund.status = PaymentStatus.initiated
			order.refund.amount = order.order.totalAmount
		}

		return order.save()
	} catch (error) {
		winston.debug('@error cancelOrder', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findOrders = async ({ userId, skip, limit }) => {
	try {
		const query = { 'buyer.id': userId }

		const orders = await Order.find(query)
			.sort({
				createdAt: -1
			})
			.skip(skip)
			.limit(limit)

		const count = await Order.find(query).countDocuments()

		return [count, orders]
	} catch (error) {
		winston.debug('@error findOrder', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}
