import CreateHttpError from 'http-errors'
import { createBusinessCategory, User, Seller } from '../../models'
import { notifications, payments, aws } from '../../util'
import {
	createApartment,
	findSellerBankDetails,
	findDeliveriesForSeller
} from './admin.dao'

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
		const bankDetails = await findSellerBankDetails(req.params.phone)

		res.json(bankDetails)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postPaymentUpdate = async (req, res, next) => {
	try {
		const { paymentId } = req.body

		const order = await payments.pendingStatusUpdate(paymentId)

		res.json(order)
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
