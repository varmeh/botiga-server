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
	addressId,
	totalAmount,
	discountAmount,
	couponCode,
	deliveryFee,
	products
}) => {
	try {
		const user = await User.findById(userId)
		if (!user) {
			return Promise.reject(new CreateHttpError[404]('User Not Found'))
		}

		const address = user.contact.addresses.id(addressId)
		if (!address) {
			return Promise.reject(new CreateHttpError[404]('Address Not Found'))
		}

		const apartment = await Apartment.findById(address.aptId)
		const apartmentManager = apartment.sellers.id(sellerId) // required to access apartment manager info
		if (!apartmentManager) {
			return Promise.reject(
				new CreateHttpError[404]('Seller not registered to apartment')
			)
		}

		const seller = await Seller.findById(sellerId)
		if (!seller) {
			return Promise.reject(new CreateHttpError[404]('Seller not found'))
		}

		const order = new Order({
			apartment: {
				id: address.aptId,
				aptName: address.aptName,
				area: address.area,
				city: address.city,
				state: address.state,
				pincode: address.pincode
			},
			buyer: {
				id: userId,
				name: user.name,
				house: address.house,
				phone: user.contact.phone,
				whatsapp: user.contact.whatsapp,
				email: user.contact.email
			},
			seller: {
				// seller contact information would be specific to user
				id: sellerId,
				brandName: apartmentManager.brandName,
				phone: apartmentManager.contact.phone,
				whatsapp: apartmentManager.contact.whatsapp,
				email: apartmentManager.contact.email,
				accountId: seller.mid
			},
			order: {
				number: chance().integer({ min: 100000, max: 999999 }),
				status: 'open',
				totalAmount,
				discountAmount,
				couponCode,
				deliveryFee,
				expectedDeliveryDate: apartmentManager.deliveryDate,
				deliverySlot: apartmentManager.delivery.slot,
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
