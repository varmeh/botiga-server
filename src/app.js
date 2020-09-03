import express from 'express'
import rTracer from 'cls-rtracer'
import cors from 'cors'
import helmet from 'helmet'

import {
	errorLogger,
	requestLogger,
	responseLogger,
	sendErrorResponse
} from './util'

import configureRoutes from './main.routes'
import { configureApp } from './configuration'

const app = express()

/* Configuration */
configureApp(app)

/* Configure Middlewares */
app.use(rTracer.expressMiddleware())
app.use(helmet())
app.use(
	cors({
		exposedHeaders: ['access-token', 'icm-token']
	})
)
app.use('/*', express.json())

/* Configure Logger */
app.use(requestLogger)
app.use(responseLogger)

/* Add routes */
configureRoutes(app)

/* Central Error Handling - Should be done before starting listener */
app.use(errorLogger)
app.use(sendErrorResponse)

export default app
