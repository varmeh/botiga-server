import CreateHttpError from 'http-errors'
import { winston } from '../../../util'
import { Seller } from '../../../models'

export const createSeller = async ({
	companyName,
	businessCategory,
	firstName,
	lastName,
	brandName,
	phone,
	hashedPin
}) => {
	try {
		const seller = new Seller({
			companyName,
			businessCategory,
			owner: { firstName, lastName },
			brand: { name: brandName },
			pin: hashedPin,
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
		seller.pin = pin
		return await seller.save()
	} catch (error) {
		winston.debug('@error updateSellerPin', { error, msg: error.message })
		return Promise.reject(new CreateHttpError[500]())
	}
}
