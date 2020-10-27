import {} from 'dotenv/config'
import { mongooseConnect, winston, notifications } from './util'
import app from './app'

const startServer = async () => {
	try {
		await mongooseConnect()
		notifications.configure() // Configure push notifications

		const port = process.env.PORT || 3000
		app.listen(port, () => {
			winston.debug(`Server on http://localhost:${port}`)
		})
	} catch (err) {
		winston.debug('Unable to connect to the database:', err)
		process.exit(1)
	}
}

startServer()
