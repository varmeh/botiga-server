import CreateHttpError from 'http-errors'

import { token } from '../../util'
import { apartmentVirtuals } from '../../models'
import {
	findSellersInApartment,
	findProductsBySeller,
	findCart,
	updateCart
} from './user.dao'

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
				delivery: { type, day }
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
				deliveryMessage: apartmentVirtuals.deliveryMessage(type, day),
				deliveryDate: apartmentVirtuals.deliveryDate(type, day)
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

export const getUserCart = async (req, res, next) => {
	try {
		const cart = await findCart(token.get(req))

		res.json({ ...cart })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchUserCart = async (req, res, next) => {
	const { sellerId, addressId, products } = req.body
	try {
		await updateCart({
			userId: token.get(req),
			sellerId,
			addressId,
			products
		})

		res.json({ message: 'cart updated' })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
