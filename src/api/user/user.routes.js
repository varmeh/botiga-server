import { Router } from 'express'

import { token } from '../../util'
import authRouter from './auth/user.auth.routes'

import {} from './user.validator'
import { getSellersInApartment } from './user.controller'

const router = Router()

router.use('/auth', authRouter)

router.get(
	'/apartments/:apartmentId',
	token.authenticationMiddleware,
	getSellersInApartment
)

export default router
