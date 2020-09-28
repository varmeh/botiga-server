import CreateHttpError from 'http-errors'
import { token } from '../../../util'

import { findOrderById } from './seller.order.dao'

export const postCancelOrder = async (req, res, next) => {
	const { orderId } = req.body

	try {
		// Verify Seller Id
		const order = await findOrderById(orderId)

		if (order.seller.id !== token.get(req)) {
			// Ensuring the buyer for this order
			throw new CreateHttpError[400]('Order Id does not belong to this Seller')
		}

		order.order.status('cancelled')

		await order.save()

		res.json({ message: 'cancelled', id: order._id })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
