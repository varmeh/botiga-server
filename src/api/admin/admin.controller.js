import CreateHttpError from 'http-errors'
import { createBusinessCategory, User } from '../../models'
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

export const postNotificationApartment = (req, res, next) => {
	const { apartmentId, title, content } = req.body
	try {
		notifications.apartment.send({
			apartmentId,
			title,
			body: content,
			type: notifications.subscriberType.Users
		})
		res.json({ message: 'notification send to apartment topic' })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postNotificationUser = async (req, res, next) => {
	const { userId, title, content } = req.body
	try {
		const user = await User.findById(userId)

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
