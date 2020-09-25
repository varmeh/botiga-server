import CreateHttpError from 'http-errors'
import { token } from '../../util'

import {
	findSellersInApartment,
	findProductsBySeller,
	createOrder
} from './user.dao'

export const getSellersInApartment = async (req, res, next) => {
	const { apartmentId } = req.params

	try {
		const sellers = await findSellersInApartment(apartmentId)

		res.json(sellers)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getProductsOfSeller = async (req, res, next) => {
	const { sellerId } = req.params

	try {
		const products = await findProductsBySeller(sellerId)

		res.json(products)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

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
