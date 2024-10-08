import CreateHttpError from 'http-errors'
import { crypto, moment, dbErrorHandler } from '../../../util'
import { Apartment, Seller } from '../../../models'

export const findSeller = async sellerId => {
	try {
		const seller = await Seller.findById(sellerId)
		if (!seller) {
			return Promise.reject(new CreateHttpError[404]('Seller Not Found'))
		}
		return seller
	} catch (error) {
		return dbErrorHandler(error, 'findSeller')
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
		return dbErrorHandler(error, 'updateContactInformation')
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

		seller.gstin = !gstin ? seller.gstin : gstin

		if (fssaiNumber) seller.fssai.number = fssaiNumber

		if (fssaiValidityDate)
			seller.fssai.validity = moment(fssaiValidityDate, 'YYYY-MM-DD')
				.endOf('day')
				.toDate()

		if (!seller.fssai.certificateUrls.includes(fssaiCertificateUrl)) {
			seller.fssai.certificateUrls.push(fssaiCertificateUrl)
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
		return dbErrorHandler(error, 'updateBusinessInformation')
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
		return dbErrorHandler(error, 'updateBankDetails')
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
		return dbErrorHandler(error, 'getBankDetails')
	}
}

export const updateBanners = async (sellerId, banners) => {
	try {
		const seller = await findSeller(sellerId)

		seller.banners = banners

		return await seller.save()
	} catch (error) {
		return dbErrorHandler(error, 'updateBanners')
	}
}

/**********************************
 * Coupons Db Access
 *********************************/

export const createCoupon = async (
	sellerId,
	{
		couponCode,
		discountType,
		discountValue,
		minimumOrderValue,
		maxDiscountAmount,
		expiryDate,
		visibleToAllCustomers
	}
) => {
	try {
		const seller = await findSeller(sellerId)

		seller.coupons.push({
			couponCode,
			discountType,
			discountValue,
			minimumOrderValue,
			maxDiscountAmount,
			expiryDate: moment(expiryDate, 'YYYY-MM-DD').endOf('day').toDate(),
			visibleToAllCustomers
		})

		const updatedSeller = await seller.save()

		return updatedSeller.coupons
	} catch (error) {
		return dbErrorHandler(error, 'createCoupon')
	}
}

export const updateCoupon = async (
	sellerId,
	{
		couponId,
		couponCode,
		discountType,
		discountValue,
		minimumOrderValue,
		maxDiscountAmount,
		expiryDate,
		visibleToAllCustomers
	}
) => {
	try {
		const seller = await findSeller(sellerId)

		const coupon = seller.coupons.id(couponId)

		if (!coupon) {
			return Promise.reject(new CreateHttpError[404]('Coupon Not Found'))
		}

		coupon.couponCode = couponCode
		coupon.discountType = discountType
		coupon.discountValue = discountValue
		coupon.minimumOrderValue = !minimumOrderValue
			? coupon.minimumOrderValue
			: minimumOrderValue
		coupon.maxDiscountAmount = !maxDiscountAmount
			? coupon.maxDiscountAmount
			: maxDiscountAmount

		coupon.expiryDate = moment(expiryDate, 'YYYY-MM-DD').endOf('day').toDate()

		coupon.visibleToAllCustomers = visibleToAllCustomers ?? true

		const updatedSeller = await seller.save()

		return updatedSeller.coupons
	} catch (error) {
		return dbErrorHandler(error, 'updateCoupon')
	}
}

export const removeCoupon = async (sellerId, couponId) => {
	try {
		const seller = await findSeller(sellerId)

		const coupon = seller.coupons.id(couponId)

		if (!coupon) {
			return Promise.reject(new CreateHttpError[404]('Coupon Not Found'))
		}

		coupon.remove()
		const updatedSeller = await seller.save()

		return updatedSeller.coupons
	} catch (error) {
		return dbErrorHandler(error, 'deleteCoupon')
	}
}
