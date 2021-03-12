import CreateHttpError from 'http-errors'
import { Types } from 'mongoose'

import { moment, dbErrorHandler } from '../../../util'
import { Order, OrderStatus, PaymentStatus } from '../../../models'

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
				// Set completion date
				order.order.completionDate = moment().toDate()

				// Refund Initiated
				if (order.payment.status === PaymentStatus.success) {
					order.refund.status = PaymentStatus.initiated
					order.refund.amount = order.order.totalAmount
				}
				break

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
		return dbErrorHandler(error, 'updateOrder')
	}
}

export const updateRefund = async (orderId, sellerId) => {
	try {
		const order = await Order.findOne({
			_id: orderId,
			'seller.id': sellerId
		})

		if (!order) {
			return Promise.reject(new CreateHttpError[404]('Order Not Found'))
		}

		order.refund.status = PaymentStatus.success
		order.refund.date = moment().toDate()

		return await order.save()
	} catch (error) {
		return dbErrorHandler(error, 'updateRefund')
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
		const date = moment(dateString, 'YYYY-MM-DD').startOf('day')

		const query = {
			createdAt: {
				$gte: date.toDate(),
				$lte: moment(date).endOf('day').toDate()
			},
			'seller.id': sellerId,
			'apartment.id': apartmentId
		}

		const orders = await Order.find(query, {
			buyer: 1,
			order: 1,
			createdAt: 1,
			payment: 1,
			refund: 1
		})
			.sort({
				createdAt: -1
			})
			.skip(skip)
			.limit(limit)

		const count = await Order.find(query).countDocuments()

		return [count, orders]
	} catch (error) {
		return dbErrorHandler(error, 'findOrdersByApartment')
	}
}

/* Date String expected in ISO 8601 format - YYYY-MM-YY */
export const findSellerAggregatedData = async (sellerId, dateString) => {
	try {
		const date = moment(dateString, 'YYYY-MM-DD').startOf('day')

		const data = await Order.aggregate([
			{
				$match: {
					createdAt: {
						$gte: date.toDate(),
						$lte: moment(date).endOf('day').toDate()
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
		return dbErrorHandler(error, 'findSellerAggregatedData')
	}
}
