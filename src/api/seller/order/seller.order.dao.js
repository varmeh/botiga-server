import CreateHttpError from 'http-errors'
import moment from 'moment'
import { Types } from 'mongoose'

import { winston } from '../../../util'
import { Order, OrderStatus } from '../../../models'

export const updateOrder = async (
	orderId,
	sellerId,
	status,
	newDate = null
) => {
	try {
		const order = await Order.findOne({
			_id: orderId,
			'seller.id': sellerId
		})

		if (!order) {
			return Promise.reject(new CreateHttpError[404]('Order Not Found'))
		}

		order.order.status = status

		switch (status) {
			case OrderStatus.cancelled:
			case OrderStatus.delivered:
				// Set completion date
				order.order.completionDate = moment.utc().toDate()
				break

			case OrderStatus.delayed:
				order.order.expectedDeliveryDate = moment
					.utc(newDate, 'YYYY-MM-DD')
					.endOf('day')
					.toDate()
				break

			default:
		}

		return await order.save()
	} catch (error) {
		winston.debug('@error updateOrder', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
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
		const date = moment.utc(dateString, 'YYYY-MM-DD').startOf('day')

		const query = {
			'order.expectedDeliveryDate': {
				$gte: date.toDate(),
				$lte: moment.utc(date).endOf('day').toDate()
			},
			'seller.id': sellerId,
			'apartment.id': apartmentId
		}

		const deliveries = await Order.find(query, { buyer: 1, order: 1 })
			.sort({
				createdAt: 1
			})
			.skip(skip)
			.limit(limit)

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

/* Date String expected in ISO 8601 format - YYYY-MM-YY */
export const findOrdersByApartment = async ({
	sellerId,
	apartmentId,
	dateString,
	skip,
	limit
}) => {
	try {
		const date = moment.utc(dateString, 'YYYY-MM-DD').startOf('day')

		const query = {
			'order.orderDate': {
				$gte: date.toDate(),
				$lte: moment.utc(date).endOf('day').toDate()
			},
			'seller.id': sellerId,
			'apartment.id': apartmentId
		}

		const orders = await Order.find(query, { buyer: 1, order: 1 })
			.sort({
				createdAt: -1
			})
			.skip(skip)
			.limit(limit)

		const count = await Order.find(query).countDocuments()

		return [count, orders]
	} catch (error) {
		winston.debug('@error findOrdersByApartment', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}

/* Date String expected in ISO 8601 format - YYYY-MM-YY */
export const findSellerAggregatedData = async (sellerId, dateString) => {
	try {
		const date = moment.utc(dateString, 'YYYY-MM-DD').startOf('day')

		const data = await Order.aggregate([
			{
				$match: {
					'order.orderDate': {
						$gte: date.toDate(),
						$lte: moment.utc(date).endOf('day').toDate()
					},
					'seller.id': Types.ObjectId(sellerId)
				}
			},
			{
				$group: {
					_id: '$apartment.id',
					aptName: { $first: '$apartment.aptName' },
					area: { $first: '$apartment.area' },
					orders: { $sum: 1 },
					revenue: { $sum: '$order.totalAmount' }
				}
			},
			{
				$project: {
					_id: 1,
					apartmentName: {
						$concat: ['$aptName', ', ', '$area']
					},
					orders: 1,
					revenue: 1
				}
			}
		])

		return data
	} catch (error) {
		winston.debug('@error findSellerAggregatedData', {
			error,
			msg: error.message
		})
		return Promise.reject(new CreateHttpError[500]())
	}
}
