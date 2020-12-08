import admin from 'firebase-admin'

const configure = () => {
	const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount)
	})
}

const notificationPayload = (title, body) => {
	return {
		notification: {
			title,
			body,
			clickAction: 'FLUTTER_NOTIFICATION_CLICK',
			sound: 'default'
		}
	}
}

const messagingOptions = { timeToLive: 4 * 60 * 60 } //4 Hrs TTL

const sendToUser = (token, title, body) => {
	admin
		.messaging()
		.sendToDevice(token, notificationPayload(title, body), messagingOptions)
}

const sendToTopic = (topic, title, body) => {
	admin
		.messaging()
		.sendToTopic(topic, notificationPayload(title, body), messagingOptions)
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
