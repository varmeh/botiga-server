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
		const categories = await findProductsBySeller(sellerId)

		const flatCategories = categories.map(category => {
			const { _id, name, products } = category

			const flatProducts = products.map(product => {
				const { _id, name, price, description, imageUrl, available } = product

				return {
					id: _id,
					name,
					price,
					available,
					description,
					imageUrl,
					size: product.sizeInfo
				}
			})

			return { categoryId: _id, name, products: flatProducts }
		})

		res.json(flatCategories)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
