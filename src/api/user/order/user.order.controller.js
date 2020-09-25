import CreateHttpError from 'http-errors'
import { token } from '../../../util'

import { createOrder } from './user.order.dao'

export const postOrder = async (req, res, next) => {
	const {
		sellerId,
		brandName,
		apartmentContact: { phone, whatsapp, email },
		totalAmount,
		products
	} = req.body

	try {
		// Verify Seller Id
		const order = await createOrder({
			userId: token.get(req),
			sellerId,
			brandName,
			sellerContact: { phone, whatsapp, email },
			totalAmount,
			products
		})

		res.status(201).json(order)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
