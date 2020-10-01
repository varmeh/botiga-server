import mongoose from 'mongoose'
import { winston } from './winston.logger'

const { DB_CONNECTION_STRING } = process.env

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
export const mongooseConnect = async () => {
	try {
		await mongoose.connect(DB_CONNECTION_STRING, options)
		winston.info('Mongodb connected')
	} catch (error) {
		winston.debug('@mongodb error', {
			msg: 'initial connection error',
			error
		})
		throw Error('Mongodb Connection Failed')
	}

	mongoose.connection.on('error', error => {
		winston.error('@mongodb error', {
			msg: 'after initial connection error',
			error
		})
	})
}
