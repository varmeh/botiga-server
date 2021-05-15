import CreateHttpError from 'http-errors'
import { winston, dbErrorHandler } from '../../util'
import { Apartment, Seller, Order } from '../../models'

export const findSellerByNumber = async phone => {
	try {
		const seller = await Seller.findOne({ 'contact.phone': phone })
		if (!seller) {
			return Promise.reject(new CreateHttpError[404]('Seller not found'))
		}

		return seller
	} catch (error) {
		return dbErrorHandler(error, 'findSellerByNumber')
	}
}

export const findApartment = async apartmentId => {
	try {
		const apartments = await Apartment.find(
			{ _id: apartmentId },
			{
				name: 1,
				area: 1,
				city: 1,
				state: 1,
				pincode: 1,
				banners: 1,
				sellers: 1,
				marketingBanners: 1
			}
		)
		if (apartments.length === 0) {
			return Promise.reject(new CreateHttpError[404]('Apartment not found'))
		}
		return apartments[0]
	} catch (error) {
		return dbErrorHandler(error, 'findApartment')
	}
}

export const createApartment = async ({
	name,
	area,
	city,
	state,
	pincode,
	location: { lat, long }
}) => {
	try {
		const apartment = new Apartment({
			name,
			area,
			city,
			state,
			pincode,
			location: { type: 'Point', coordinates: [long, lat] }
		})
		return await apartment.save()
	} catch (error) {
		winston.debug('@error createApartment', { error })
		if (error.code === 11000) {
			// Apartment in area already exists
			return Promise.reject(
				new CreateHttpError[409]('Apartment already exists')
			)
		}

		return Promise.reject(new CreateHttpError[500]())
	}
}

export const addApartmentBanner = async ({
	apartmentId,
	bannerUrl,
	sellerId,
	position
}) => {
	try {
		// The condition marketingBanners.4 ensures that only 5 banners could be added
		// Once marketingBanners[4] exist is true, filter fails
		await Apartment.updateOne(
			{ _id: apartmentId, 'marketingBanners.4': { $exists: false } },
			{
				$push: {
					marketingBanners: {
						$each: [{ url: bannerUrl, sellerId }],
						$position: position - 1
					}
				}
			},
			{ upsert: true }
		)

		const { marketingBanners } = await findApartment(apartmentId)

		return marketingBanners
	} catch (error) {
		winston.debug('@error addApartmentBanner', { error })
		if (error.code === 11000) {
			// Apartment in area already exists
			return Promise.reject(
				new CreateHttpError[409]('max 5 marketing banners allowed')
			)
		}
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const removeApartmentBanner = async (apartmentId, bannerId) => {
	try {
		const apartment = await findApartment(apartmentId)

		const banner = apartment.marketingBanners.id(bannerId)

		if (!banner) {
			return Promise.reject(new CreateHttpError[404]('Banner Not Found'))
		}

		banner.remove()

		const { marketingBanners } = await apartment.save()
		return marketingBanners
	} catch (error) {
		return dbErrorHandler(error, 'removeApartmentBanner')
	}
}

export const findOrdersByOrderNumber = async number => {
	try {
		return await Order.find({ 'order.number': number }).sort({
			createdAt: -1
		})
	} catch (error) {
		return dbErrorHandler(error, 'findOrderByOrderNumber')
	}
}

export const findOrdersByPhoneNumber = async number => {
	try {
		return await Order.find({ 'buyer.phone': number })
			.sort({
				createdAt: -1
			})
			.limit(50)
	} catch (error) {
		return dbErrorHandler(error, 'findOrdersByPhoneNumber')
	}
}
