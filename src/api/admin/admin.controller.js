import CreateHttpError from 'http-errors'
import { nanoid } from 'nanoid'

import { createBusinessCategory, User, Seller } from '../../models'
import { notifications, payments, aws, crypto } from '../../util'
import {
	createApartment,
	findSellerByNumber,
	updateSellerBankDetails,
	findDeliveriesForSeller
} from './admin.dao'

const sellerOrchestrator = seller => {
	const {
		businessName,
		businessCategory,
		owner: { firstName, lastName },
		brand: { name, tagline, imageUrl },
		contact: { phone, whatsapp, email },
		bankDetails
	} = seller

	let returnBankDetails = {}
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

		returnBankDetails = {
			editable,
			verified,
			beneficiaryName: crypto.decryptString(beneficiaryName),
			accountNumber: crypto.decryptString(accountNumber),
			ifscCode,
			bankName,
			accountType
		}
	}

	return {
		businessName,
		businessCategory,
		owner: `${firstName} ${lastName}`,
		brand: name,
		tagline,
		brandImageUrl: imageUrl,
		phone,
		whatsapp,
		email,
		...returnBankDetails,
		mid: seller.mid
	}
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

export const patchPaymentUpdate = async (req, res, next) => {
	try {
		const { paymentId } = req.body

		const order = await payments.pendingStatusUpdate(paymentId)

		res.json(order)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postTestTransaction = async (req, res, next) => {
	try {
		const { phone, txnAmount } = req.body

		const seller = await findSellerByNumber(phone)

		const paymentId = nanoid(24)
		const data = await payments.paytmInitiateTransaction({
			paymentId,
			txnAmount,
			sellerMid: seller.mid,
			customerId: phone,
			callbackUrl: `${process.env.API_HOST_URL}/api/admin/transaction/status?paymentId=${paymentId}`
		})

		res.json(data)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getTransactionStatus = async (req, res, next) => {
	try {
		console.error(`transaction query: ${req.query}`)
		const txnStatus = await payments.getTransactionStatus(req.query)

		res.json(txnStatus)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getDeliveryXls = async (req, res, next) => {
	const { sellerPhone, date } = req.params

	try {
		const deliveries = await findDeliveriesForSeller({
			sellerPhone,
			dateString: date
		})
		res.json(deliveries)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const testEmail = (_, res) => {
	aws.ses.sendMail({
		from: 'noreply@botiga.app',
		to: 'varun@botiga.app',
		subject: 'test subject',
		text: 'hope it works!!!',
		filename: 'test.xls',
		path: '/Users/varunmehta/Desktop/premium.xls'
	})

	res.json({ message: 'done' })
}
