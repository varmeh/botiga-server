import CreateHttpError from 'http-errors'
import { winston, notifications } from '../../../util'
import { Seller } from '../../../models'

export const createSeller = async ({
	businessName,
	firstName,
	lastName,
	brandName,
	businessCategory,
	brandUrl,
	tagline,
	phone
}) => {
	try {
		const seller = new Seller({
			businessName,
			businessCategory,
			owner: { firstName, lastName },
			brand: { name: brandName, tagline, imageUrl: brandUrl },
			contact: {
				phone,
				whatsapp: phone
			}
		})
		return await seller.save()
	} catch (error) {
		winston.debug('@error createSeller', { error })
		if (error.code === 11000 && error.keyValue['contact.phone'] === phone) {
			// Phone number already used.
			return Promise.reject(
				new CreateHttpError[409]('Phone number already taken')
			)
		}
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findSellerByNumber = async number => {
	try {
		return await Seller.findOne({
			'contact.phone': number
		})
	} catch (error) {
		winston.debug('@error findSellerByNumber', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const updateSellerPin = async (sellerId, pin) => {
	try {
		const seller = await Seller.findById(sellerId)
		seller.loginPin = pin
		return await seller.save()
	} catch (error) {
		winston.debug('@error updateSellerPin', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const updateToken = async (sellerId, token) => {
	try {
		const seller = await Seller.findById(sellerId)
		if (seller.contact.pushTokens.includes(token)) {
			return 'token already exists'
		}
		seller.contact.pushTokens.push(token)
		await seller.save()

		// Register new token to all seller apartment topics for notifications
		seller.apartments.forEach(apartment =>
			notifications.apartment.subscribe({
				type: notifications.subscriberType.Sellers,
				apartmentId: apartment._id,
				userToken: token
			})
		)
		// Register user to apartment topic for notifications
		return 'token added'
	} catch (error) {
		winston.debug('@error updateToken', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}
