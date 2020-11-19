import CreateHttpError from 'http-errors'
import { winston, crypto } from '../../util'
import { Apartment, Seller } from '../../models'

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

export const findSellerByNumber = async phone => {
	try {
		return await Seller.findOne({ 'contact.phone': phone })
	} catch (error) {
		winston.debug('@error findSellerByNumber', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findSellerBankDetails = async phone => {
	try {
		const seller = await findSellerByNumber(phone)

		if (!seller) {
			return Promise.reject(new CreateHttpError[404]('Seller not found'))
		}

		if (!seller.bankDetails.beneficiaryName) {
			return Promise.reject(
				new CreateHttpError[404]('Bank Details not available')
			)
		}

		const {
			editable,
			beneficiaryName,
			accountNumber,
			ifscCode,
			bankName
		} = seller.bankDetails

		return {
			editable,
			beneficiaryName: crypto.decryptString(beneficiaryName),
			accountNumber: crypto.decryptString(accountNumber),
			ifscCode,
			bankName
		}
	} catch (error) {
		winston.debug('@error findSellerBankDetails', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}
