import CreateHttpError from 'http-errors'

import { findSellersInApartment, findProductsBySeller } from './user.dao'

export const getSellersInApartment = async (req, res, next) => {
	const { apartmentId } = req.params

	try {
		const sellers = await findSellersInApartment(apartmentId)

		const sellersData = sellers.map(seller => {
			const {
				_id,
				contact: { phone, whatsapp },
				live,
				brandName,
				businessCategory,
				brandImageUrl,
				tagline,
				deliveryMessage,
				deliveryDate
			} = seller

			return {
				id: _id,
				brandName,
				live,
				businessCategory,
				brandImageUrl,
				tagline,
				phone,
				whatsapp,
				deliveryMessage,
				deliveryDate
			}
		})

		res.json(sellersData)
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
