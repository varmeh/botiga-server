import { Router } from 'express'

import { token } from '../../util'
import authRouter from './auth/user.auth.routes'

import { getSellersInApartment, getProductsOfSeller } from './user.controller'

const router = Router()

router.use('/auth', authRouter)

router.get(
	'/apartments/:apartmentId',
	token.authenticationMiddleware,
	getSellersInApartment
)

router.get(
	'/products/:sellerId',
	token.authenticationMiddleware,
	getProductsOfSeller
)

export default router
