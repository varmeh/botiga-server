import { nanoid } from 'nanoid'
import CreateHttpError from 'http-errors'

import { createBusinessCategory, User, Seller } from '../../models'
import {
	notifications,
	aws,
	rpayPayments,
	uploadTinifyImages,
	controllerErroHandler
} from '../../util'
import {
	findApartment,
	addApartmentBanner,
	removeApartmentBanner,
	createApartment,
	copyApartmentData,
	findSellerByNumber,
	findOrdersByOrderNumber,
	findOrdersByPhoneNumber
} from './admin.dao'

const orderOrchestrator = order => {
	const {
		seller,
		apartment,
		buyer: { name, house, phone, whatsapp },
		order: {
			number,
			status,
			totalAmount,
			discountAmount,
			couponCode,
			deliveryFee,
			expectedDeliveryDate,
			deliverySlot,
			completionDate,
			products
		},
		createdAt,
		_id,
		payment,
		refund
	} = order

	return {
		id: _id,
		buyer: {
			name,
			house,
			apartment: apartment.aptName,
			area: apartment.area,
			phone,
			whatsapp
		},
		number,
		status,
		totalAmount,
		discountAmount,
		couponCode,
		deliveryFee,
		orderDate: createdAt,
		expectedDeliveryDate,
		deliverySlot,
		completionDate,
		seller,
		products,
		payment,
		refund
	}
}

export const getApartment = async (req, res, next) => {
	try {
		const apartment = await findApartment(req.params.apartmentId)
		res.json(apartment)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postApartment = async (req, res, next) => {
	try {
		const areas = await createApartment(req.body)
		res.json(areas)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postApartmentBanner = async (req, res, next) => {
	try {
		const banners = await addApartmentBanner(req.body)
		res.json(banners)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postApartmentsCopy = async (req, res, next) => {
	try {
		const { srcApartmentId, dstApartmentId } = req.body
		const apartment = await copyApartmentData(srcApartmentId, dstApartmentId)
		res.json(apartment)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const deleteApartmentBanner = async (req, res, next) => {
	try {
		const { apartmentId, bannerId } = req.params
		const banners = await removeApartmentBanner(apartmentId, bannerId)
		res.json(banners)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postBusinessCategory = async (req, res, next) => {
	try {
		await createBusinessCategory(req.body.category)

		res.status(201).json()
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postNotificationTopic = (req, res, next) => {
	const { topic, title, content, imageUrl, sellerId } = req.body
	try {
		notifications.sendToTopic({
			topic,
			title,
			body: content,
			imageUrl,
			sellerId
		})
		res.json({
			message: `notification send to topic - ${topic}`
		})
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postNotificationUser = async (req, res, next) => {
	const { id, title, content } = req.body
	try {
		const user = await User.findById(id)

		if (!user) {
			throw new CreateHttpError[404]('User Not Found')
		}

		const tokens = user.contact.pushTokens
		for (let i = 0; i < tokens.length; i++) {
			notifications.sendToDevice(tokens[i], title, content)
		}

		res.json({ message: 'notification send to user devices' })
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postNotificationSeller = async (req, res, next) => {
	const { id, title, content } = req.body
	try {
		const seller = await Seller.findById(id)

		if (!seller) {
			throw new CreateHttpError[404]('Seller Not Found')
		}

		const tokens = seller.contact.pushTokens
		for (let i = 0; i < tokens.length; i++) {
			notifications.sendToDevice(tokens[i], title, content)
		}

		res.json({ message: 'notification send to seller devices' })
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postTestTransaction = async (req, res, next) => {
	try {
		const { phone, txnAmount } = req.body

		const seller = await findSellerByNumber(phone)

		const data = await rpayPayments.initiateTestTransaction({
			txnAmount,
			sellerMid: seller.mid
		})

		res.json(data)
	} catch (error) {
		controllerErroHandler(error, next)
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
		controllerErroHandler(error, next)
	}
}

export const postBannerImage = async (req, res, next) => {
	try {
		const image = req.file

		if (!image) {
			res.status(422).json({
				message: 'Attached file should be an image of type - png/jpg/jpeg'
			})
		} else {
			const imageUrl = await uploadTinifyImages({
				image,
				fileNameToBeSavedInCloud: nanoid(24),
				width: 960,
				height: 480
			})

			res.json({ imageUrl })
		}
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postImageDelete = async (req, res, next) => {
	try {
		await aws.s3.deleteImageUrl(req.body.imageUrl)
		res.status(204).json()
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getOrderByOrderNumber = async (req, res, next) => {
	try {
		const orders = await findOrdersByOrderNumber(req.params.number)

		if (orders.length > 0) {
			const orderList = orders.map(order => orderOrchestrator(order))
			res.json({ count: orderList.length, orders: orderList })
		} else {
			throw new CreateHttpError[404]('Order Not Found')
		}
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getOrdersByPhoneNumber = async (req, res, next) => {
	try {
		const orders = await findOrdersByPhoneNumber(req.params.number)
		if (orders.length > 0) {
			const orderList = orders.map(order => orderOrchestrator(order))
			res.json({ count: orderList.length, orders: orderList })
		} else {
			throw new CreateHttpError[404]('Customer Not Found')
		}
	} catch (error) {
		controllerErroHandler(error, next)
	}
}
