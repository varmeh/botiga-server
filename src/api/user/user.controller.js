import CreateHttpError from 'http-errors'

import { token } from '../../util'
import { apartmentVirtuals } from '../../models'
import {
	findSellersInApartment,
	findApartmentInfo,
	findSeller,
	findCart,
	updateCart
} from './user.dao'

const sellersOrchestrator = sellers => {
	const sellersData = sellers.map(seller => {
		const {
			_id,
			contact: { phone, whatsapp, address },
			fssaiLicenseNumber,
			live,
			brandName,
			businessCategory,
			brandImageUrl,
			tagline,
			delivery: { type, day, slot, fee, minOrder }
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
			deliveryDate: apartmentVirtuals.deliveryDate(type, day),
			deliverySlot: slot,
			deliveryFee: fee ?? 0,
			deliveryMinOrder: minOrder ?? 0,
			fssaiLicenseNumber,
			address
		}
	})

	return sellersData
}

export const getSellersInApartment = async (req, res, next) => {
	const { apartmentId } = req.params

	try {
		const sellers = await findSellersInApartment(apartmentId)

		const sellersData = sellersOrchestrator(sellers)

		res.json(sellersData)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getApartmentData = async (req, res, next) => {
	try {
		const { apartmentId } = req.params
		const sellers = await findSellersInApartment(apartmentId)
		const {
			banners,
			marketingBanners,
			name,
			area,
			city,
			state,
			pincode
		} = await findApartmentInfo(apartmentId)

		res.json({
			name,
			area,
			city,
			state,
			pincode,
			marketingBanners,
			banners,
			sellers: sellersOrchestrator(sellers)
		})
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

const categoryOrchestrator = categories => {
	const flatCategories = categories.map(category => {
		const { _id, name, products, visible } = category

		const flatProducts = products.map(product => {
			const {
				_id,
				name,
				price,
				mrp,
				description,
				imageUrl,
				available,
				tag,
				imageUrlLarge,
				secondaryImageUrls
			} = product

			return {
				id: _id,
				name,
				price,
				mrp,
				available,
				description,
				imageUrl,
				size: product.sizeInfo,
				tag,
				imageUrlLarge,
				secondaryImageUrls
			}
		})

		return { categoryId: _id, name, visible, products: flatProducts }
	})

	return flatCategories
}

export const getProductsOfSeller = async (req, res, next) => {
	const { sellerId } = req.params

	try {
		const { categories } = await findSeller(sellerId)

		res.json(categoryOrchestrator(categories))
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getSellerData = async (req, res, next) => {
	const { sellerId } = req.params

	try {
		const { banners, categories, coupons } = await findSeller(sellerId)

		res.json({ banners, coupons, categories: categoryOrchestrator(categories) })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getUserCart = async (req, res, next) => {
	try {
		const cart = await findCart(token.get(req), req.params.addressId)

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
