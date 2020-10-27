import admin from 'firebase-admin'

const configure = () => {
	admin.initializeApp({
		credential: admin.credential.applicationDefault()
	})
}

const notificationPayload = (title, body) => {
	return {
		notification: {
			title,
			body,
			clickAction: 'FLUTTER_NOTIFICATION_CLICK'
		}
	}
}

const messagingOptions = { timeToLive: 4 * 60 * 60 } //4 Hrs TTL

const sendToUser = (pushToken, title, body) => {
	admin
		.messaging()
		.sendToDevice(pushToken, notificationPayload(title, body), messagingOptions)
}

const subscriberType = {
	Users: 'users',
	Sellers: 'sellers'
}

const apartment = {
	subscribe: ({ apartmentId, userToken, type = subscriberType.Users }) => {
		admin.messaging().subscribeToTopic(userToken, `${apartmentId}_${type}`)
	},
	send: ({ apartmentId, title, body, type = subscriberType.Users }) => {
		admin
			.messaging()
			.sendToTopic(
				`${apartmentId}_${type}`,
				notificationPayload(title, body),
				messagingOptions
			)
	}
}

export default { configure, sendToUser, apartment, subscriberType }
