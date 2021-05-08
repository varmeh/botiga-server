import CreateHttpError from 'http-errors'
import {
	token,
	paginationData,
	skipData,
	controllerErroHandler
} from '../../../util'
import { OrderStatus, User } from '../../../models'

import {
	updateOrder,
	updateRefund,
	findOrdersByApartment,
	findSellerAggregatedData,
	findOrdersByOrderNumber,
	findOrdersByPhoneNumber
} from './seller.order.dao'

const orderOrchestrator = order => {
	const {
		apartment,
		buyer: { name, house, phone, whatsapp },
		order: {
			number,
			status,
			totalAmount,
			discountAmount,
			couponCode,
			deliveryFee,
			expectedDeliveryDate,
			deliverySlot,
			completionDate,
			products
		},
		createdAt,
		_id,
		payment,
		refund
	} = order

	return {
		id: _id,
		buyer: {
			name,
			house,
			apartment: apartment.aptName,
			phone,
			whatsapp
		},
		number,
		status,
		totalAmount,
		discountAmount,
		couponCode,
		deliveryFee,
		orderDate: createdAt,
		expectedDeliveryDate,
		deliverySlot,
		completionDate,
		products,
		payment,
		refund
	}
}

export const postCancelOrder = async (req, res, next) => {
	try {
		const { orderId } = req.body
		const order = await updateOrder(
			orderId,
			token.get(req),
			OrderStatus.cancelled
		)

		const user = await User.findById(order.buyer.id)

		user.sendNotifications(
			'Order Cancelled',
			`Your order #${order.order.number} from ${order.seller.brandName} has been cancelled`,
			orderId
		)

		res.json({ message: 'cancelled', id: order._id, refund: order.refund })
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const patchRefundCompleted = async (req, res, next) => {
	try {
		const { orderId } = req.body
		const order = await updateRefund(orderId, token.get(req))

		const user = await User.findById(order.buyer.id)

		user.sendNotifications(
			'Refund Completed',
			`Your refund for order #${order.order.number} from ${order.seller.brandName} has been completed`,
			orderId
		)

		res.json({
			message: 'refund completed',
			id: orderId,
			refund: order.refund
		})
	} catch (error) {
		controllerErroHandler(error, next)
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

		const orderData = orders.map(odr => {
			delete odr.order.$init
			const { buyer, order, createdAt, payment, refund, _id } = odr
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
			orders: orderData
		})
	} catch (error) {
		controllerErroHandler(error, next)
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
		controllerErroHandler(error, next)
	}
}

export const getOrderByOrderNumber = async (req, res, next) => {
	try {
		const orders = await findOrdersByOrderNumber(
			token.get(req),
			req.params.number
		)

		if (orders.length > 0) {
			const orderList = orders.map(order => orderOrchestrator(order))
			res.json({ count: orderList.length, orders: orderList })
		} else {
			throw new CreateHttpError[404]('Order Not Found')
		}
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getOrdersByPhoneNumber = async (req, res, next) => {
	try {
		const orders = await findOrdersByPhoneNumber(
			token.get(req),
			req.params.number
		)
		if (orders.length > 0) {
			const orderList = orders.map(order => orderOrchestrator(order))
			res.json({ count: orderList.length, orders: orderList })
		} else {
			throw new CreateHttpError[404]('Customer Not Found')
		}
	} catch (error) {
		controllerErroHandler(error, next)
	}
}
