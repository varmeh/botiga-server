import admin from 'firebase-admin'

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

const sendToUser = (token, title, body, orderId) => {
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
		notificationPayload.data.orderId = orderId
	}

	admin.messaging().sendToDevice(token, notificationPayload, messagingOptions)
}

const sendToTopic = ({ topic, title, body, imageUrl, sellerId }) => {
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
		notificationPayload.notification.imageUrl = imageUrl
	}

	if (sellerId) {
		notificationPayload.data.sellerId = sellerId
	}

	admin.messaging().send(notificationPayload)
}

const apartment = {
	subscribeUser: (apartmentId, userToken) => {
		admin.messaging().subscribeToTopic(userToken, `${apartmentId}_users`)
	},
	subscribeSeller: (apartmentId, sellerToken) => {
		admin.messaging().subscribeToTopic(sellerToken, `${apartmentId}_sellers`)
	}
}

export default { configure, sendToUser, sendToTopic, apartment }
