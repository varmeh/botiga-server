import { Router } from 'express'

import { token, validationMiddleware } from '../../util'
import authRouter from './auth/user.auth.routes'

import {
	getSellerValidator,
	getProductsValidator,
	postOrderValidator
} from './user.validator'

import {
	getSellersInApartment,
	getProductsOfSeller,
	postOrder
} from './user.controller'

const router = Router()

router.use('/auth', authRouter)

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

router.post(
	'/order',
	token.authenticationMiddleware,
	postOrderValidator,
	validationMiddleware,
	postOrder
)

export default router
