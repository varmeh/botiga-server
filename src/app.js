import express from 'express'
import rTracer from 'cls-rtracer'
import cors from 'cors'
import helmet from 'helmet'
import multer from 'multer'

import {
	logErrorMiddleware,
	logRequestMiddleware,
	logResponseMiddleware,
	errorResponseMiddleware
} from './util'

import configureRoutes from './main.routes'
import { configureApp } from './configuration'

const app = express()

/* Configuration */
configureApp(app)

/* Configure Middlewares */
app.use(rTracer.expressMiddleware())
app.use(helmet())

const fileFilter = (_, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg'
	) {
		cb(null, true)
	} else {
		// File not allowed
		cb(null, false)
	}
}
app.use(
	multer({ fileFilter, limits: { fileSize: 1024 * 1024 } }).single('image')
)

app.use('/*', express.json())

app.use(
	cors({
		exposedHeaders: ['Authorization']
	})
)

/* Configure Logger */
app.use(logRequestMiddleware)
app.use(logResponseMiddleware)

/* Add routes */
configureRoutes(app)

/* Central Error Handling - Should be done before starting listener */
app.use(logErrorMiddleware)
app.use(errorResponseMiddleware)

export default app
