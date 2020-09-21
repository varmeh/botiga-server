import admin from 'firebase-admin'

const configure = () => {
	admin.initializeApp({
		credential: admin.credential.applicationDefault()
	})
}

const send = (title, body) => {
	admin.messaging().sendAll({
		notification: {
			title,
			body
		}
	})
}

export default { configure, send }
