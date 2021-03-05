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
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*') //* to give access to any origin
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization' //to give access to all the headers provided
	)
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET') //to give access to all the methods provided
		return res.status(200).json({})
	}
	return next()
})

app.use(cors({ origin: true }))
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
