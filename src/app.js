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

app.use(cors({ optionsSuccessStatus: 200 }))

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
app.use(multer({ fileFilter }).single('image'))

app.use('/*', express.json())

/* Configure Logger */
app.use(logRequestMiddleware)
app.use(logResponseMiddleware)

/* Add routes */
configureRoutes(app)

/* Central Error Handling - Should be done before starting listener */
app.use(logErrorMiddleware)
app.use(errorResponseMiddleware)

export default app
