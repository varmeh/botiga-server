import CreateHttpError from 'http-errors'
import { winston } from '../../../util'
import { Seller } from '../../../models'

export const dbCreateSeller = async ({
	companyName,
	businessCategory,
	firstName,
	lastName,
	gender,
	brandName,
	phone,
	hashedPin
}) => {
	try {
		const seller = new Seller({
			companyName,
			businessCategory,
			owner: { firstName, lastName, gender },
			brand: { name: brandName },
			pin: hashedPin,
			contact: {
				phone,
				whatsapp: phone
			}
		})
		return await seller.save()
	} catch (error) {
		winston.debug('@error dbCreateSeller', { error })
		if (error.code === 11000 && error.keyValue['contact.phone'] === phone) {
			// Phone number already used.
			return Promise.reject(
				new CreateHttpError[409]('Phone number already taken')
			)
		}
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const dbFindSellerByNumber = async number => {
	try {
		return await Seller.findOne({
			'contact.phone': number
		})
	} catch (error) {
		winston.debug('@error dbFindSellerByNumber', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}
