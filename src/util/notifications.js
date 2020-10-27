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

const apartment = {
	subscribe: ({ apartmentId, userToken, type = 'users' }) => {
		if (type !== 'users' || type !== 'sellers') {
			throw new Error('Invalid Type. Valid Values - users & sellers')
		}
		admin.messaging().subscribeToTopic(userToken, `${apartmentId}_${type}`)
	},
	send: ({ apartmentId, title, body, type = 'users' }) => {
		if (type !== 'users' || type !== 'sellers') {
			throw new Error('Invalid Type. Valid Values - users & sellers')
		}
		admin
			.messaging()
			.sendToTopic(
				`${apartmentId}_${type}`,
				notificationPayload(title, body),
				messagingOptions
			)
	}
}

export default { configure, sendToUser, apartment }
