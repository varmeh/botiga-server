import CreateHttpError from 'http-errors'
import { token, paginationData, skipData, notifications } from '../../../util'
import { OrderStatus, User } from '../../../models'

import { updateOrder, findDeliveriesByApartment } from './seller.delivery.dao'

const sendNotifications = async (userId, title, body) => {
	// Send notification to seller devices
	const user = await User.findById(userId)

	user.contact.pushTokens.forEach(token =>
		notifications.sendToUser(token, title, body)
	)
}

export const patchDeliveryStatus = async (req, res, next) => {
	const { orderId, status } = req.body

	try {
		const orderStatus =
			status === 'out' ? OrderStatus.outForDelivery : OrderStatus.delivered

		const order = await updateOrder(orderId, token.get(req), orderStatus)

		if (orderStatus === OrderStatus.outForDelivery) {
			await sendNotifications(
				order.buyer.id,
				'Order in delivery',
				`Your order #${order.order.number} from ${order.seller.brandName} is out for delivery`
			)
		} else {
			await sendNotifications(
				order.buyer.id,
				'Order delivered',
				`Your order #${order.order.number} from ${order.seller.brandName} has been delivered`
			)
		}

		res.json({ message: status, id: order._id })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchDeliveryDelay = async (req, res, next) => {
	const { orderId, newDate } = req.body

	try {
		const order = await updateOrder(
			orderId,
			token.get(req),
			OrderStatus.delayed,
			newDate
		)

		await sendNotifications(
			order.buyer.id,
			'Order delivery date changed',
			`Your order #${order.order.number} from ${order.seller.brandName}, delivery date has been changed to ${newDate}`
		)

		res.json({ message: `delivery date changed to ${newDate}`, id: order._id })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getDeliveryByApartment = async (req, res, next) => {
	const { apartmentId, date } = req.params

	const { skip, limit, page } = skipData(req.query)

	try {
		const [totalOrders, deliveries] = await findDeliveriesByApartment({
			sellerId: token.get(req),
			apartmentId,
			dateString: date,
			skip,
			limit
		})

		const deliveryData = deliveries.map(delivery => {
			delete delivery.order.$init
			const { buyer, order, createdAt, payment, refund, _id } = delivery
			return {
				id: _id,
				buyer,
				order: {
					orderDate: createdAt,
					...order
				},
				payment,
				refund
			}
		})
		res.json({
			...paginationData({ limit, totalOrders, currentPage: page }),
			deliveries: deliveryData
		})
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
