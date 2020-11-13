import CreateHttpError from 'http-errors'
import { createBusinessCategory, User, Seller } from '../../models'
import { notifications } from '../../util'
import { createApartment } from './admin.dao'

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
		notifications.sendToTopic({
			topic,
			title,
			body: content
		})
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
