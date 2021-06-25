import { token, controllerErroHandler } from '../../util'
import { apartmentVirtuals, findHelperData } from '../../models'
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
			homeImageUrl,
			homeTagline,
			newlyLaunched,
			limitedDelivery,
			tagline,
			delivery: { type, day, weeklySchedule, slot, fee, minOrder },
			filters
		} = seller

		// Apartment deliveryDate not working here as it is a virtual property
		// Refer - https://stackoverflow.com/questions/30038855/mongoose-virtuals-in-mongodb-aggregate
		return {
			id: _id,
			brandName,
			live,
			businessCategory,
			brandImageUrl,
			homeImageUrl,
			homeTagline,
			newlyLaunched,
			limitedDelivery,
			tagline,
			phone,
			whatsapp,
			deliveryMessage: 'No Longer Used',
			deliveryDate: apartmentVirtuals.deliveryDate(type, day, weeklySchedule),
			deliverySlot: slot,
			deliveryFee: fee ?? 0,
			deliveryMinOrder: minOrder ?? 0,
			fssaiLicenseNumber,
			address,
			filters: filters ?? []
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
		controllerErroHandler(error, next)
	}
}

export const getApartmentData = async (req, res, next) => {
	try {
		const { apartmentId } = req.params
		const sellers = await findSellersInApartment(apartmentId)
		const { marketingBanners, name, area, city, state, pincode } =
			await findApartmentInfo(apartmentId)

		const { sellerFilters } = await findHelperData()

		res.json({
			name,
			area,
			city,
			state,
			pincode,
			filters: sellerFilters ?? [],
			marketingBanners: marketingBanners ?? [],
			banners: [], // keeping this empty banner to avoid crashes
			sellers: sellersOrchestrator(sellers)
		})
	} catch (error) {
		controllerErroHandler(error, next)
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
				secondaryImageUrls,
				recommended
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
				secondaryImageUrls,
				recommended
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
		controllerErroHandler(error, next)
	}
}

export const getSellerData = async (req, res, next) => {
	const { sellerId } = req.params

	try {
		const { banners, categories, coupons, recommendedProducts } =
			await findSeller(sellerId)

		res.json({
			hasRecommendedProducts: recommendedProducts.allowed > 0,
			numberOfRecommendedProducts: recommendedProducts.selected,
			banners,
			coupons,
			categories: categoryOrchestrator(categories)
		})
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getUserCart = async (req, res, next) => {
	try {
		const cart = await findCart(token.get(req), req.params.addressId)

		res.json({ ...cart })
	} catch (error) {
		controllerErroHandler(error, next)
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
		controllerErroHandler(error, next)
	}
}
