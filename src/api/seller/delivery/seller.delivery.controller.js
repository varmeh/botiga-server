import CreateHttpError from 'http-errors'
import { token, paginationData, skipData } from '../../../util'
import { OrderStatus, User } from '../../../models'

import {
	updateOrder,
	findDeliveriesByApartment,
	findAggregateDeliveries
} from './seller.delivery.dao'

export const patchDeliveryStatus = async (req, res, next) => {
	const { orderId, status } = req.body

	try {
		const orderStatus =
			status === 'out' ? OrderStatus.outForDelivery : OrderStatus.delivered

		const order = await updateOrder(orderId, token.get(req), orderStatus)

		const user = await User.findById(order.buyer.id)
		if (orderStatus === OrderStatus.outForDelivery) {
			user.sendNotifications(
				'Order in delivery',
				`Your order #${order.order.number} from ${order.seller.brandName} is out for delivery`
			)
		} else {
			user.sendNotifications(
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

		const user = await User.findById(order.buyer.id)

		user.sendNotifications(
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

export const getAggregateDelivery = async (req, res, next) => {
	try {
		const deliveries = await findAggregateDeliveries({
			sellerId: token.get(req),
			date: req.params.date
		})

		res.json(deliveries)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
