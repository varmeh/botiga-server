import moment from 'moment'
import CreateHttpError from 'http-errors'
import { notifications, dbErrorHandler } from '../../../util'
import { Seller } from '../../../models'

export const createSeller = async ({
	businessName,
	firstName,
	lastName,
	brandName,
	businessCategory,
	businessType,
	gstin,
	fssaiNumber,
	fssaiValidityDate,
	fssaiCertificateUrl,
	brandUrl,
	tagline,
	phone
}) => {
	try {
		const seller = new Seller({
			businessName,
			businessCategory,
			businessType,
			gstin,
			owner: { firstName, lastName },
			brand: { name: brandName, tagline, imageUrl: brandUrl },
			contact: {
				phone,
				whatsapp: phone
			}
		})

		if (fssaiNumber && fssaiValidityDate && fssaiCertificateUrl) {
			seller.fssai.number = fssaiNumber
			seller.fssai.validity = moment(fssaiValidityDate, 'YYYY-MM-DD')
				.endOf('day')
				.toDate()
			seller.fssai.certificateUrls.push(fssaiCertificateUrl)
		}

		return await seller.save()
	} catch (error) {
		if (error.code === 11000 && error.keyValue['contact.phone'] === phone) {
			// Phone number already used.
			return Promise.reject(
				new CreateHttpError[409]('Phone number already taken')
			)
		}
		return dbErrorHandler(error, 'createSeller')
	}
}

export const findSellerByNumber = async number => {
	try {
		return await Seller.findOne({
			'contact.phone': number
		})
	} catch (error) {
		return dbErrorHandler(error, 'findSellerByNumber')
	}
}

export const updateToken = async (sellerId, token) => {
	try {
		const seller = await Seller.findById(sellerId)

		// Register new token to all seller apartment topics for notifications
		seller.apartments.forEach(apartment =>
			notifications.apartment.subscribeSeller(apartment._id, token)
		)

		if (seller.contact.pushTokens.includes(token)) {
			return 'token already exists'
		}
		seller.contact.pushTokens.push(token)
		await seller.save()

		// Register user to apartment topic for notifications
		return 'token added'
	} catch (error) {
		return dbErrorHandler(error, 'updateToken')
	}
}
