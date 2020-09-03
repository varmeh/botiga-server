// Import winston logger first to configure default logger
import './axios.config'

export const configureApp = app => {
	app.disable('x-powered-by')
}
