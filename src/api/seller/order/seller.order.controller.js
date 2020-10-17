import CreateHttpError from 'http-errors'
import moment from 'moment'
import { token, paginationData, skipData } from '../../../util'

import {
	findOrderForSeller,
	findDeliveriesByApartment,
	findOrdersByApartment,
	findSellerAggregatedData
} from './seller.order.dao'

export const postCancelOrder = async (req, res, next) => {
	const { orderId } = req.body

	try {
		const order = await findOrderForSeller(orderId, token.get(req))

		order.order.status = 'cancelled'
		await order.save()

		// TODO: notify user that order has been cancelled

		res.json({ message: 'cancelled', id: order._id })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchDeliveryStatus = async (req, res, next) => {
	const { orderId, status } = req.body

	try {
		const order = await findOrderForSeller(orderId, token.get(req))

		order.order.status = status

		if (order.order.status === 'delivered') {
			// Set actual delivery date
			order.order.actualDeliveryDate = new Date()
		}
		await order.save()

		// TODO: notify user that change in order status

		res.json({ message: status, id: order._id })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchDeliveryDelay = async (req, res, next) => {
	const { orderId, newDate } = req.body

	try {
		const order = await findOrderForSeller(orderId, token.get(req))

		order.order.status = 'delayed'
		order.order.expectedDeliveryDate = moment
			.utc(newDate, 'YYYY-MM-DD')
			.endOf('day')
			.toDate()
		await order.save()

		// TODO: notify user that change in order status

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
