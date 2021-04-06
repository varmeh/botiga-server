import admin from 'firebase-admin'
import { winston } from './winston.logger'

const configure = () => {
	const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount)
	})
}

const messagingOptions = {
	timeToLive: 4 * 60 * 60, // 4hrs
	priority: 'high',
	mutableContent: true,
	contentAvailable: true
}

const sendToDevice = async (token, title, body, orderId) => {
	const notificationPayload = {
		notification: {
			title,
			body,
			clickAction: 'FLUTTER_NOTIFICATION_CLICK',
			sound: 'default'
		},
		data: {}
	}

	if (orderId) {
		notificationPayload.data.orderId = `${orderId}`
	}

	try {
		await admin
			.messaging()
			.sendToDevice(token, notificationPayload, messagingOptions)
	} catch (error) {
		winston.error('@firebase notification error', {
			notificationPayload,
			error
		})
	}
}

const sendToTopic = async ({ topic, title, body, imageUrl, sellerId }) => {
	const notificationPayload = {
		notification: {
			title,
			body
		},
		android: {
			priority: 'high',
			ttl: 4 * 60 * 60,
			notification: {
				sound: 'default',
				defaultSound: true,
				clickAction: 'FLUTTER_NOTIFICATION_CLICK'
			}
		},
		apns: {
			payload: {
				aps: {
					sound: 'default',
					mutableContent: true
				}
			}
		},
		data: {},
		topic
	}

	if (imageUrl) {
		notificationPayload.notification.imageUrl = `${imageUrl}`
	}

	if (sellerId) {
		notificationPayload.data.sellerId = `${sellerId}`
	}

	try {
		await admin.messaging().send(notificationPayload)
	} catch (error) {
		winston.error('@firebase notification error', {
			notificationPayload,
			error
		})
	}
}

const apartment = {
	subscribeUser: (apartmentId, userToken) => {
		admin.messaging().subscribeToTopic(userToken, `${apartmentId}_users`)
	},
	subscribeSeller: (apartmentId, sellerToken) => {
		admin.messaging().subscribeToTopic(sellerToken, `${apartmentId}_sellers`)
	}
}

export default { configure, sendToDevice, sendToTopic, apartment }
