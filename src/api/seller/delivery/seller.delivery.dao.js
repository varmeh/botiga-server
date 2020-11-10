import CreateHttpError from 'http-errors'

import { winston, moment } from '../../../util'
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
		winston.debug('@error findDeliveriesByApartment', {
			error,
			msg: error.message
		})
		return Promise.reject(new CreateHttpError[500]())
	}
}
