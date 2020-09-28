import CreateHttpError from 'http-errors'
import moment from 'moment'

import { winston } from '../../../util'
import { Order } from '../../../models'

export const findOrderById = async orderId => {
	try {
		const order = await Order.findById(orderId)
		if (!order) {
			return Promise.reject(new CreateHttpError[404]('Order Not Found'))
		}

		return order
	} catch (error) {
		winston.debug('@error findOrderById', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findDeliveriesByApartmentId = async (sellerId, apartmentId) => {
	try {
		const today = moment().startOf('day')

		const orders = await Order.find({
			'order.expectedDeliveryDate': {
				$gte: today.toDate(),
				$lte: moment(today).endOf('day').toDate()
			},
			'seller.id': sellerId,
			apartmentId
		}).sort({
			createdAt: -1
		})

		return orders
	} catch (error) {
		winston.debug('@error findOrderById', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}
