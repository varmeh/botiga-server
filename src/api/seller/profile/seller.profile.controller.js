import { nanoid } from 'nanoid'
import {
	token,
	aws,
	uploadTinifyImages,
	controllerErroHandler
} from '../../../util'
import {
	findSeller,
	updateContactInformation,
	updateBusinessInformation,
	updateBankDetails,
	findBankDetails,
	updateBanners,
	createCoupon,
	updateCoupon,
	removeCoupon
} from './seller.profile.dao'

const getContactInfo = contact => {
	const { address, countryCode, phone, whatsapp, email } = contact
	return { countryCode, phone, whatsapp, email, address }
}

const sellerBusinessInfoOrchestrator = seller => {
	const {
		businessName,
		businessCategory,
		businessType,
		gstin,
		fssai,
		brand,
		recommendedProducts: { allowed, selected }
	} = seller

	const data = {
		businessName,
		businessCategory,
		businessType,
		gstin,
		brand,
		maxRecommendedProducts: allowed,
		selectedRecommendedProducts: selected
	}

	if (fssai) {
		data.fssaiNumber = fssai.number
		data.fssaiValidityDate = fssai.validity
		data.fssaiCertificateUrl =
			fssai.certificateUrls[fssai.certificateUrls.length - 1]
	}

	return data
}

export const getProfileInformation = async (req, res, next) => {
	try {
		const seller = await findSeller(token.get(req))

		res.json({
			firstName: seller.owner.firstName,
			lastName: seller.owner.lastName,
			...sellerBusinessInfoOrchestrator(seller),
			contact: getContactInfo(seller.contact),
			apartments: seller.apartments
		})
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getContactInformation = async (req, res, next) => {
	try {
		const seller = await findSeller(token.get(req))
		res.json(getContactInfo(seller.contact))
	} catch (error) {
		controllerErroHandler(error, next)
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
		controllerErroHandler(error, next)
	}
}

export const getBusinessInformation = async (req, res, next) => {
	try {
		const seller = await findSeller(token.get(req))

		res.json(sellerBusinessInfoOrchestrator(seller))
	} catch (error) {
		controllerErroHandler(error, next)
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
		const [_, contact] = await updateBusinessInformation(token.get(req), {
			brandName,
			tagline,
			imageUrl,
			updateImage,
			gstin,
			fssaiNumber,
			fssaiValidityDate,
			fssaiCertificateUrl
		})

		res.json(contact)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getBankDetails = async (req, res, next) => {
	try {
		const bankDetails = await findBankDetails(token.get(req))

		res.json(bankDetails)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const patchBankDetails = async (req, res, next) => {
	const { beneficiaryName, accountNumber, ifscCode, bankName, accountType } =
		req.body

	try {
		const seller = await updateBankDetails({
			sellerId: token.get(req),
			beneficiaryName,
			accountNumber,
			ifscCode,
			bankName,
			accountType
		})

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
		controllerErroHandler(error, next)
	}
}

/**********************************
 * Banners API
 *********************************/

export const getBanners = async (req, res, next) => {
	try {
		const seller = await findSeller(token.get(req))

		res.json({ banners: seller.banners })
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const patchBanners = async (req, res, next) => {
	try {
		const seller = await updateBanners(token.get(req), req.body.banners)

		res.json({
			message: 'banners updated',
			banners: seller.banners
		})
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const patchBannerImage = async (req, res, next) => {
	try {
		const image = req.file

		if (!image) {
			res.status(422).json({
				message: 'Attached file should be an image of type - png/jpg/jpeg'
			})
		}

		const fileName = `${token.get(req)}_${nanoid(6)}`

		const imageUrl = await uploadTinifyImages({
			image,
			fileNameToBeSavedInCloud: fileName,
			width: 960,
			height: 480
		})

		res.json({ imageUrl })
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

/**********************************
 * Coupons API
 *********************************/
export const getCoupons = async (req, res, next) => {
	try {
		const seller = await findSeller(token.get(req))

		res.json({ coupons: seller.coupons })
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postCoupon = async (req, res, next) => {
	try {
		const coupons = await createCoupon(token.get(req), req.body)

		res.json({
			message: 'coupon created',
			coupons
		})
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const patchCoupon = async (req, res, next) => {
	try {
		const coupons = await updateCoupon(token.get(req), req.body)

		res.json({
			message: 'coupon updated',
			coupons
		})
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const deleteCoupon = async (req, res, next) => {
	try {
		const coupons = await removeCoupon(token.get(req), req.params.couponId)

		res.json({
			message: 'coupon deleted',
			coupons
		})
	} catch (error) {
		controllerErroHandler(error, next)
	}
}
