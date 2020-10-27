import CreateHttpError from 'http-errors'
import { token, paginationData, skipData, notifications } from '../../../util'
import { OrderStatus } from '../../../models'

import {
	updateOrder,
	findDeliveriesByApartment,
	findOrdersByApartment,
	findSellerAggregatedData
} from './seller.order.dao'

export const postCancelOrder = async (req, res, next) => {
	const { orderId } = req.body

	try {
		const order = await updateOrder(
			orderId,
			token.get(req),
			OrderStatus.cancelled
		)

		if (!order.buyer.pushToken) {
			notifications.sendToUser(
				order.buyer.pushToken,
				'Order Cancelled',
				`Your order #${order.order.number} from ${order.seller.brandName} has been cancelled `
			)
		}

		res.json({ message: 'cancelled', id: order._id })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchDeliveryStatus = async (req, res, next) => {
	const { orderId, status } = req.body

	try {
		const orderStatus =
			status === 'out' ? OrderStatus.outForDelivery : OrderStatus.delivered

		const order = await updateOrder(orderId, token.get(req), orderStatus)

		if (!order.buyer.pushToken) {
			if (orderStatus === OrderStatus.outForDelivery) {
				notifications.sendToUser(
					order.buyer.pushToken,
					'Order in delivery',
					`Your order #${order.order.number} from ${order.seller.brandName} is in delivery`
				)
			} else {
				notifications.sendToUser(
					order.buyer.pushToken,
					'Order delivered',
					`Your order #${order.order.number} from ${order.seller.brandName} has been delivered`
				)
			}
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

		notifications.sendToUser(
			order.buyer.pushToken,
			'Order delayed',
			`Your order #${order.order.number} from ${order.seller.brandName} has been delayed to ${newDate}`
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
			const { buyer, order, _id } = delivery
			return {
				id: _id,
				buyer,
				order
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

export const getOrdersByApartmentDate = async (req, res, next) => {
	const { apartmentId, date } = req.params

	const { skip, limit, page } = skipData(req.query)

	try {
		const [totalOrders, orders] = await findOrdersByApartment({
			sellerId: token.get(req),
			apartmentId,
			dateString: date,
			skip,
			limit
		})

		const orderData = orders.map(order => ({
			id: order._id,
			buyer: order.buyer,
			order: order.order
		}))

		res.json({
			...paginationData({ limit, totalOrders, currentPage: page }),
			orders: orderData
		})
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getOrdersAggregate = async (req, res, next) => {
	try {
		const data = await findSellerAggregatedData(token.get(req), req.params.date)

		let totalRevenue = 0
		let totalOrders = 0

		const apartmentWiseBreakup = data.map(d => {
			const { _id, apartmentName, orders, revenue } = d
			totalRevenue += revenue
			totalOrders += orders
			return { id: _id, apartmentName, orders, revenue }
		})
		res.json({ totalRevenue, totalOrders, apartmentWiseBreakup })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
