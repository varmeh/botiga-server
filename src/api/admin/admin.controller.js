import fs from 'fs'
import CreateHttpError from 'http-errors'

import { createBusinessCategory, User, Seller } from '../../models'
import {
	notifications,
	aws,
	crypto,
	rpayPayments,
	generateExcel,
	winston
} from '../../util'
import {
	createApartment,
	findSellerByNumber,
	updateSellerBankDetails,
	findDeliveriesForSeller,
	addSellerApartment,
	removeSellerAllApartments,
	removeSellerApartment
} from './admin.dao'

const sellerOrchestrator = seller => {
	const {
		businessName,
		businessCategory,
		businessType,
		gstin,
		fssai,
		owner: { firstName, lastName },
		brand: { name, tagline, imageUrl },
		contact: { phone, whatsapp, email },
		bankDetails,
		apartments
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
		apartments
	}

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

export const postApartment = async (req, res, next) => {
	try {
		const areas = await createApartment(req.body)
		res.json(areas)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postBusinessCategory = async (req, res, next) => {
	try {
		await createBusinessCategory(req.body.category)

		res.status(201).json()
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postNotificationTopic = (req, res, next) => {
	const { topic, title, content } = req.body
	try {
		notifications.sendToTopic(topic, title, content)
		res.json({
			message: `notification send to topic - ${topic}`
		})
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postNotificationUser = async (req, res, next) => {
	const { id, title, content } = req.body
	try {
		const user = await User.findById(id)

		if (!user) {
			throw new CreateHttpError[404]('User Not Found')
		}

		user.contact.pushTokens.forEach(token =>
			notifications.sendToUser(token, title, content)
		)

		res.json({ message: 'notification send to user devices' })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postNotificationSeller = async (req, res, next) => {
	const { id, title, content } = req.body
	try {
		const seller = await Seller.findById(id)

		if (!seller) {
			throw new CreateHttpError[404]('Seller Not Found')
		}

		seller.contact.pushTokens.forEach(token =>
			notifications.sendToUser(token, title, content)
		)

		res.json({ message: 'notification send to seller devices' })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getSellerDetails = async (req, res, next) => {
	try {
		const seller = await findSellerByNumber(req.params.phone)

		res.json(sellerOrchestrator(seller))
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
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
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postTestTransaction = async (req, res, next) => {
	try {
		const { phone, txnAmount } = req.body

		const seller = await findSellerByNumber(phone)

		const data = await rpayPayments.routeTransaction({
			txnAmount,
			sellerMid: seller.mid
		})

		res.json(data)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postTestTransactionNotify = async (req, res, next) => {
	try {
		const { phone, txnAmount, paymentId } = req.body

		const seller = await findSellerByNumber(phone)

		const {
			contact: { email },
			owner
		} = seller

		if (email) {
			aws.ses.sendMail({
				from: 'support@botiga.app',
				to: email,
				subject: `${seller.brand.name} - Botiga test payment acknowledgement!!!`,
				text: `Hello ${owner.firstName},<br><br>Team Botiga has successfully done a test transaction of amount ${txnAmount} to your account.<br>TransactionId for this transaction is <i>${paymentId}</i>.<br>Amount settlement takes <mark>T+2</mark> days<br><br><mark>Please reply with a screenshot of amount credit to your bank account.</mark><br><br>Once confirm, you could go live into any community and start selling your amazing merchandise.<br><br>Thank you<br>Team Botiga`
			})
		}

		res.status(204).json()
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getDeliveryXls = async (req, res, next) => {
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
				to: seller.contact.email,
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
		} else {
			await aws.ses.sendMailPromise({
				from: 'noreply@botiga.app',
				to: seller.contact.email,
				subject: `Botiga - Deliveries Today - ${seller.brand.name} - ${date}`,
				text: 'NO deliveries today.'
			})
		}

		res.json(deliveries)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const deleteSellerApartments = async (req, res, next) => {
	try {
		await removeSellerAllApartments(req.params.phone)

		res.status(204).json()
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postSellerApartment = async (req, res, next) => {
	try {
		const { phone, apartmentId } = req.body
		const [apartment] = await addSellerApartment(phone, apartmentId)

		res.json(apartment)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const deleteSellerApartmentsWithId = async (req, res, next) => {
	try {
		const { phone, apartmentId } = req.params
		await removeSellerApartment(phone, apartmentId)

		res.status(204).json()
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
