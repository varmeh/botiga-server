import CreateHttpError from 'http-errors'

import { token, aws, winston } from '../../../util'
import {
	findSeller,
	updateContactInformation,
	updateBusinessInformation,
	updateBankDetails,
	findBankDetails
} from './seller.profile.dao'

const getContactInfo = contact => {
	const { address, countryCode, phone, whatsapp, email } = contact
	return { countryCode, phone, whatsapp, email, address }
}

export const getProfileInformation = async (req, res, next) => {
	try {
		const {
			owner: { firstName, lastName },
			businessName,
			businessCategory,
			businessType,
			gstin,
			fssaiNumber,
			fssaiValidityDate,
			fssaiCertificateUrl,
			brand,
			contact,
			apartments
		} = await findSeller(token.get(req))

		res.json({
			firstName,
			lastName,
			businessName,
			businessCategory,
			businessType,
			gstin,
			fssaiNumber,
			fssaiValidityDate,
			fssaiCertificateUrl,
			brand,
			contact: getContactInfo(contact),
			apartments
		})
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getContactInformation = async (req, res, next) => {
	try {
		const seller = await findSeller(token.get(req))
		res.json(getContactInfo(seller.contact))
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchContactInformation = async (req, res, next) => {
	const { email, phone, whatsapp, address = {} } = req.body
	try {
		const { building, street, city, area, state, pincode } = address
		const contact = await updateContactInformation(token.get(req), {
			email,
			phone,
			whatsapp,
			building,
			street,
			city,
			area,
			state,
			pincode
		})

		res.json(getContactInfo(contact))
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getBusinessInformation = async (req, res, next) => {
	try {
		const {
			businessName,
			businessCategory,
			businessType,
			gstin,
			fssaiNumber,
			fssaiValidityDate,
			fssaiCertificateUrl,
			owner,
			brand
		} = await findSeller(token.get(req))
		res.json({
			businessName,
			businessCategory,
			businessType,
			gstin,
			fssaiNumber,
			fssaiValidityDate,
			fssaiCertificateUrl,
			owner,
			brand
		})
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

/* Could be expanded to accomodate update of other business information */
export const patchBusinessInformation = async (req, res, next) => {
	const {
		brandName,
		tagline,
		imageUrl,
		updateImage,
		gstin,
		fssaiNumber,
		fssaiValidityDate,
		fssaiCertificateUrl
	} = req.body
	try {
		const [oldImageUrl, contact] = await updateBusinessInformation(
			token.get(req),
			{
				brandName,
				tagline,
				imageUrl,
				updateImage,
				gstin,
				fssaiNumber,
				fssaiValidityDate,
				fssaiCertificateUrl
			}
		)

		if (updateImage) {
			// User have uploaded a new image
			// Delete the old image from s3 bucket
			try {
				await aws.s3.deleteImageUrl(oldImageUrl)
			} catch (error) {
				winston.error('@error patchBusinessInformation', {
					error: error.message,
					msg: 'old image deletion failed',
					oldImageUrl
				})
			}
		}

		res.json(contact)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getBankDetails = async (req, res, next) => {
	try {
		const bankDetails = await findBankDetails(token.get(req))

		res.json(bankDetails)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const patchBankDetails = async (req, res, next) => {
	const {
		beneficiaryName,
		accountNumber,
		ifscCode,
		bankName,
		accountType
	} = req.body

	try {
		const seller = await updateBankDetails({
			sellerId: token.get(req),
			beneficiaryName,
			accountNumber,
			ifscCode,
			bankName,
			accountType
		})

		if (process.env.NODE_ENV === 'production')
			aws.ses.sendMail({
				from: 'support@botiga.app',
				to: 'support@botiga.app',
				subject: `${seller.brand.name} - Bank Details Updated`,
				text: `Phone - ${seller.contact.phone}<br>Seller - ${seller.businessName}<br>Category - ${seller.businessCategory}<br>Brand - ${seller.brand.name}`
			})

		res.json({
			message:
				'Bank details updated. Please contact support team for bank details validation'
		})
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
