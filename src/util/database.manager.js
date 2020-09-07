import mongoose from 'mongoose'
import { winston } from './winston.logger'

const {
	DB_NAME,
	DB_AUTH_ENABLED,
	DB_USER,
	DB_PWD,
	DB_HOST,
	DB_PORT,
	DB_SSL
} = process.env

const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false,
	autoIndex: false, // Don't build indexes
	poolSize: 10, // Maintain up to 10 socket connections
	serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
	socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
	family: 4 // Use IPv4, skip trying IPv6
}

// no auth string for local dev host
const authString = DB_AUTH_ENABLED === 'true' ? `${DB_USER}:${DB_PWD}@` : ''

winston.info('@2@@ ', { DB_AUTH_ENABLED, authString })

export const mongo = {
	connection: null,
	async init() {
		try {
			if (this.connection === null) {
				this.connection = await mongoose.createConnection(
					`mongodb://${authString}${DB_HOST}:${DB_PORT}/${DB_NAME}?readPreference=primary&ssl=${DB_SSL}`,
					options
				)
			}
		} catch (error) {
			winston.error('@mongodb error', {
				msg: 'initial connection error',
				error
			})
			throw Error('Mongodb Connection Failed')
		}

		this.connection.on('error', error => {
			winston.error('@mongodb error', {
				msg: 'after initial connection error',
				error
			})
		})
	}
}
