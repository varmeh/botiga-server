import { Router } from 'express'

import { token, validationMiddleware } from '../../util'

import authRouter from './auth/user.auth.routes'
import orderRouter from './order/user.order.routes'

import { getSellerValidator, getProductsValidator } from './user.validator'

import { getSellersInApartment, getProductsOfSeller } from './user.controller'

const router = Router()

router.use('/auth', authRouter)
router.use('/orders', orderRouter)

router.get(
	'/apartments/:apartmentId',
	token.authenticationMiddleware,
	getSellerValidator,
	validationMiddleware,
	getSellersInApartment
)

router.get(
	'/products/:sellerId',
	token.authenticationMiddleware,
	getProductsValidator,
	validationMiddleware,
	getProductsOfSeller
)

export default router
