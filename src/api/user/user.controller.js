import CreateHttpError from 'http-errors'

import { findSellersInApartment, findProductsBySeller } from './user.dao'

export const getSellersInApartment = async (req, res, next) => {
	const { apartmentId } = req.params

	try {
		const sellers = await findSellersInApartment(apartmentId)

		const sellersData = sellers.map(seller => {
			const {
				contact,
				live,
				brandName,
				businessCategory,
				brandImageUrl,
				tagline
			} = seller

			return {
				brandName,
				live,
				businessCategory,
				brandImageUrl,
				tagline,
				contact,
				delivery: {
					message: seller.deliveryMessage,
					date: seller.deliveryDate
				}
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
