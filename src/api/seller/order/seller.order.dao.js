import CreateHttpError from 'http-errors'
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
