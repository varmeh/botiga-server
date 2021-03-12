import CreateHttpError from 'http-errors'

import { moment, dbErrorHandler } from '../../../util'
import { Order, OrderStatus, Seller } from '../../../models'

export const updateOrder = async (orderId, status, newDate = null) => {
	try {
		const order = await Order.findById(orderId)

		if (!order) {
			return Promise.reject(new CreateHttpError[404]('Order Not Found'))
		}

		order.order.status = status

		switch (status) {
			case OrderStatus.cancelled:
			case OrderStatus.delivered:
				// Set completion date
				order.order.completionDate = moment().toDate()
				break

			case OrderStatus.delayed:
				order.order.expectedDeliveryDate = moment(newDate, 'YYYY-MM-DD')
					.endOf('day')
					.toDate()
				break

			default:
		}

		return await order.save()
	} catch (error) {
		return dbErrorHandler(error, 'sortCategory')
	}
}

export const findDeliveriesByApartment = async ({
	sellerId,
	apartmentId,
	dateString,
	skip,
	limit
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
			createdAt: 1,
			payment: 1,
			refund: 1
		})
			.sort({
				createdAt: 1
			})
			.skip(skip)
			.limit(limit)

		const count = await Order.find(query).countDocuments()

		return [count, deliveries]
	} catch (error) {
		return dbErrorHandler(error, 'sortCategory')
	}
}

export const findAggregateDeliveries = async ({ sellerId, date }) => {
	try {
		const seller = await Seller.findById(sellerId)
		if (!seller) {
			return Promise.reject(new CreateHttpError[404]('Seller not found'))
		}

		const deliveries = []
		for (const apartment of seller.apartments) {
			const [count, deliveryByApartment] = await findDeliveriesByApartment({
				sellerId,
				apartmentId: apartment._id,
				dateString: date
			})

			deliveries.push({ count, apartment, deliveries: deliveryByApartment })
		}

		return deliveries
	} catch (error) {
		return dbErrorHandler(error, 'findAggregateDeliveries')
	}
}
