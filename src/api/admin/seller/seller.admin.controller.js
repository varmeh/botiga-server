import fs from 'fs'
import { nanoid } from 'nanoid'

import {
	aws,
	crypto,
	generateExcel,
	winston,
	uploadTinifyImages,
	controllerErroHandler
} from '../../../util'

import {
	findSellerByNumber,
	findApprovedSellers,
	updateSellerBankDetails,
	findDeliveriesForSeller,
	addSellerApartment,
	addSellerConfigureApartment,
	updateApartmentLiveStatus,
	removeSellerAllApartments,
	removeSellerApartment,
	updateSellerFilters,
	updateApartmentDeliveryFee,
	updateApartmentDeliverySchedule,
	updateNotification,
	updateSellerHomeBranding
} from './seller.admin.dao'

const productsOrchestrator = categories => {
	if (!categories) {
		return []
	}

	const flatCategories = categories.map(category => {
		const { _id, name, products } = category

		const flatProducts = products.map(product => {
			const {
				_id,
				name,
				price,
				mrp,
				description,
				imageUrl,
				available,
				tag,
				imageUrlLarge,
				secondaryImageUrls
			} = product

			return {
				id: _id,
				name,
				price,
				mrp,
				available,
				description,
				imageUrl,
				size: product.sizeInfo,
				tag,
				imageUrlLarge,
				secondaryImageUrls
			}
		})

		return { categoryId: _id, name, products: flatProducts }
	})

	return flatCategories
}

const sellerOrchestrator = seller => {
	const {
		businessName,
		businessCategory,
		businessType,
		gstin,
		fssai,
		owner: { firstName, lastName },
		brand: { name, tagline, imageUrl },
		contact: { phone, whatsapp, email, address },
		bankDetails,
		apartments,
		categories,
		filters
	} = seller

	let data = {
		businessName,
		businessCategory,
		businessType,
		gstin,
		owner: `${firstName} ${lastName}`,
		brand: name,
		tagline,
		brandImageUrl: imageUrl,
		phone,
		whatsapp,
		email,
		mid: seller.mid,
		filters,
		apartments,
		address: `${address.building}, ${address.street}, ${address.area}, ${address.city}, ${address.state} - ${address.pincode}`
	}

	data.categories = productsOrchestrator(categories)

	if (seller.bankDetails.beneficiaryName) {
		// Seller bank details available
		const {
			editable,
			verified,
			beneficiaryName,
			accountNumber,
			ifscCode,
			bankName,
			accountType
		} = bankDetails

		data = {
			...data,
			editable,
			verified,
			beneficiaryName: crypto.decryptString(beneficiaryName),
			accountNumber: crypto.decryptString(accountNumber),
			ifscCode,
			bankName,
			accountType
		}
	}

	if (fssai) {
		data.fssaiNumber = fssai.number
		data.fssaiValidityDate = fssai.validity
		data.fssaiCertificateUrl =
			fssai.certificateUrls[fssai.certificateUrls.length - 1]
	}

	return data
}

export const patchSellerFilters = async (req, res, next) => {
	try {
		const { phone, filters } = req.body

		const seller = await updateSellerFilters(phone, filters)

		res.json(sellerOrchestrator(seller))
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const patchDeliveryFee = async (req, res, next) => {
	const { phone, apartmentId, deliveryMinOrder, deliveryFee } = req.body
	try {
		const apartment = await updateApartmentDeliveryFee({
			phone,
			apartmentId,
			deliveryMinOrder,
			deliveryFee
		})
		res.json(apartment)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const patchDeliverySchedule = async (req, res, next) => {
	const { phone, apartmentId, deliveryType, day, slot, weekly } = req.body
	try {
		const apartment = await updateApartmentDeliverySchedule({
			phone,
			apartmentId,
			deliveryType,
			day,
			slot,
			weekly
		})
		res.json(apartment)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getApprovedSellers = async (_, res, next) => {
	try {
		const sellers = await findApprovedSellers()

		const approvedSellerList = sellers.map(({ _id, brand, contact }) => ({
			id: _id,
			brand: brand.name,
			phone: contact.phone
		}))

		res.json(approvedSellerList)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getSellerDetails = async (req, res, next) => {
	try {
		const seller = await findSellerByNumber(req.params.phone)

		res.json(sellerOrchestrator(seller))
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const patchSellerBankDetails = async (req, res, next) => {
	const { phone, editable, verified, mid } = req.body
	try {
		const seller = await updateSellerBankDetails({
			phone,
			editable,
			verified,
			mid
		})

		res.json(sellerOrchestrator(seller))
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getDelivery = async (req, res, next) => {
	const { sellerPhone, date } = req.params

	try {
		const [_, deliveries] = await findDeliveriesForSeller({
			sellerPhone,
			dateString: date
		})

		res.json(deliveries)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getDeliveryXlsToCustomerSupport = async (req, res, next) => {
	const { sellerPhone, date } = req.params

	try {
		const [seller, deliveries] = await findDeliveriesForSeller({
			sellerPhone,
			dateString: date
		})

		if (deliveries.length > 0) {
			const fileName = `${seller.brand.name}_${date}.xlsx`
			const xlsPath = await generateExcel({
				deliveryData: deliveries,
				fileName
			})
			await aws.ses.sendMailPromise({
				from: 'noreply@botiga.app',
				to: 'support@botiga.app',
				subject: `Botiga - Deliveries Today - ${seller.brand.name} - ${date}`,
				text: 'Your deliveries for the day.',
				filename: fileName,
				path: xlsPath
			})

			try {
				winston.debug('@delivery file removal', { xlsPath })
				fs.unlinkSync(xlsPath) //file removed
			} catch (err) {
				winston.debug('@delivery file removal failed', { xlsPath, err })
			}
		}

		res.json(deliveries)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const deleteSellerApartments = async (req, res, next) => {
	try {
		await removeSellerAllApartments(req.params.phone)

		res.status(204).json()
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postSellerApartment = async (req, res, next) => {
	try {
		const { phone, apartmentId } = req.body
		const [apartment] = await addSellerApartment(phone, apartmentId)

		res.json(apartment)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postSellerConfigureApartment = async (req, res, next) => {
	try {
		const [apartment] = await addSellerConfigureApartment(req.body)

		res.json(apartment)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const patchApartmentLiveStatus = async (req, res, next) => {
	try {
		const { phone, apartmentId, live } = req.body
		const apartment = await updateApartmentLiveStatus(phone, apartmentId, live)

		res.json(apartment)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const deleteSellerApartmentsWithId = async (req, res, next) => {
	try {
		const { phone, apartmentId } = req.params
		await removeSellerApartment(phone, apartmentId)

		res.status(204).json()
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getNotificationDetails = async (req, res, next) => {
	try {
		const { notification, apartments } = await findSellerByNumber(
			req.params.phone
		)

		res.json({ notification, apartments })
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const patchNotificationDetails = async (req, res, next) => {
	try {
		const { phone, title, content, imageUrl } = req.body

		const { notification } = await updateNotification({
			phone,
			title,
			content,
			imageUrl
		})

		res.json(notification)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const patchHomeBranding = async (req, res, next) => {
	try {
		const image = req.file

		let imageUrl = null
		if (image) {
			imageUrl = await uploadTinifyImages({
				image,
				fileNameToBeSavedInCloud: nanoid(24),
				width: 320,
				height: 320
			})
		}

		const { phone, tagline, limitedDelivery, newlyLaunched, overlayTag } =
			req.body

		const { brand } = await updateSellerHomeBranding({
			phone,
			tagline,
			imageUrl,
			limitedDelivery,
			newlyLaunched,
			overlayTag
		})

		res.json(brand)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}
