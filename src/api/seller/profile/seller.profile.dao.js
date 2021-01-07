import moment from 'moment'
import CreateHttpError from 'http-errors'
import { winston, crypto } from '../../../util'
import { Apartment, Seller } from '../../../models'

export const findSeller = async sellerId => {
	try {
		return await Seller.findById(sellerId)
	} catch (error) {
		winston.debug('@error findSeller', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const updateContactInformation = async (
	sellerId,
	{ email, phone, whatsapp, building, street, city, area, state, pincode }
) => {
	try {
		const seller = await Seller.findById(sellerId)

		const { contact } = seller

		contact.email = !email ? contact.email : email
		contact.phone = !phone ? contact.phone : phone
		contact.whatsapp = !whatsapp ? contact.whatsapp : whatsapp

		const { address } = contact

		address.building = !building ? address.building : building
		address.street = !street ? address.street : street
		address.area = !area ? address.area : area
		address.city = !city ? address.city : city
		address.state = !state ? address.state : state
		address.pincode = !pincode ? address.pincode : pincode

		const updatedSeller = await seller.save()
		return updatedSeller.contact
	} catch (error) {
		winston.debug('@error updateContactInformation', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const updateBusinessInformation = async (
	sellerId,
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
) => {
	try {
		const seller = await Seller.findById(sellerId)

		const { brand } = seller

		const oldImageUrl = brand.imageUrl

		brand.name = !brandName ? brand.name : brandName
		brand.tagline = !tagline ? brand.tagline : tagline

		brand.gstin = !gstin ? brand.gstin : gstin

		if (
			fssaiNumber &&
			fssaiValidityDate &&
			fssaiCertificateUrl &&
			fssaiNumber !== seller.fssaiNumber
		) {
			seller.fssaiNumber = fssaiNumber
			seller.fssaiValidityDate = moment(fssaiValidityDate, 'YYYY-MM-DD')
				.endOf('day')
				.toDate()

			if (!seller.fssaiCertificateUrl.includes(fssaiCertificateUrl)) {
				seller.fssaiCertificateUrl.push(fssaiCertificateUrl)
			}
		}

		if (updateImage) {
			brand.imageUrl = imageUrl
		}

		/* Brand info needs to be updated in all apartments serviced by seller */

		// Don't use map or forEach to avoid complication - https://zellwk.com/blog/async-await-in-loops/#:~:text=If%20you%20use%20await%20in,asynchronous%20functions%20always%20return%20promises.&text=Since%20map%20always%20return%20promises,do%20this%20with%20await%20Promise.
		for (let i = 0; i < seller.apartments.length; i++) {
			const apt = await Apartment.findById(seller.apartments[i]._id)
			const sellerInAptDoc = apt.sellers.id(sellerId)

			// update information
			sellerInAptDoc.brandName = brand.name
			sellerInAptDoc.tagline = brand.tagline
			sellerInAptDoc.brandImageUrl = brand.imageUrl

			await apt.save()
		}

		const updatedSeller = await seller.save()
		return [oldImageUrl, updatedSeller.brand]
	} catch (error) {
		winston.debug('@error updateBusinessInformation', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const updateBankDetails = async ({
	sellerId,
	beneficiaryName,
	accountNumber,
	ifscCode,
	bankName,
	accountType
}) => {
	try {
		const seller = await Seller.findById(sellerId)

		if (!seller.bankDetails.editable) {
			return Promise.reject(
				new CreateHttpError[401]('Bank details update not authorized')
			)
		}

		seller.bankDetails = {
			editable: false,
			beneficiaryName: crypto.encryptString(beneficiaryName),
			accountNumber: crypto.encryptString(accountNumber),
			ifscCode,
			bankName,
			accountType
		}

		seller.mid = process.env.NODE_ENV !== 'production' ? 'dummyValue' : ''

		return await seller.save()
	} catch (error) {
		winston.debug('@error updateBankDetails', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findBankDetails = async sellerId => {
	try {
		const seller = await Seller.findById(sellerId)

		const {
			editable,
			beneficiaryName,
			accountNumber,
			ifscCode,
			bankName,
			accountType
		} = seller.bankDetails

		if (!seller.bankDetails.beneficiaryName) {
			// Bank details don't exist
			return {
				editable: true,
				beneficiaryName: '',
				accountNumber: '',
				ifscCode: '',
				bankName: '',
				accountType: ''
			}
		}

		return {
			editable,
			beneficiaryName: crypto.decryptString(beneficiaryName),
			accountNumber: crypto.decryptString(accountNumber),
			ifscCode,
			bankName,
			accountType
		}
	} catch (error) {
		winston.debug('@error getBankDetails', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}
