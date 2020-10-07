import CreateHttpError from 'http-errors'
import moment from 'moment'
import { Types } from 'mongoose'

import { winston } from '../../../util'
import { Order } from '../../../models'

export const findOrderForSeller = async (orderId, sellerId) => {
	try {
		const order = await Order.findOne({
			_id: orderId,
			'seller.id': sellerId
		})
		if (!order) {
			return Promise.reject(new CreateHttpError[404]('Order Not Found'))
		}

		return order
	} catch (error) {
		winston.debug('@error findOrderById', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findDeliveriesByApartment = async (
	sellerId,
	apartmentId,
	dateString
) => {
	try {
		const date = moment.utc(dateString, 'YYYY-MM-DD').startOf('day')

		const orders = await Order.find({
			'order.expectedDeliveryDate': {
				$gte: date.toDate(),
				$lte: moment.utc(date).endOf('day').toDate()
			},
			'seller.id': sellerId,
			'apartment.id': apartmentId
		}).sort({
			createdAt: -1
		})

		return orders
	} catch (error) {
		winston.debug('@error findDeliveriesByApartment', {
			error,
			msg: error.message
		})
		return Promise.reject(new CreateHttpError[500]())
	}
}

/* Date String expected in ISO 8601 format - YYYY-MM-YY */
export const findOrdersByApartment = async (
	sellerId,
	apartmentId,
	dateString
) => {
	try {
		const date = moment.utc(dateString, 'YYYY-MM-DD').startOf('day')

		const orders = await Order.find({
			'order.orderDate': {
				$gte: date.toDate(),
				$lte: moment.utc(date).endOf('day').toDate()
			},
			'seller.id': sellerId,
			'apartment.id': apartmentId
		}).sort({
			createdAt: -1
		})

		return orders
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
