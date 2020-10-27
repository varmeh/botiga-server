import { Router } from 'express'

import { token, validationMiddleware } from '../../util'

import authRouter from './auth/user.auth.routes'
import orderRouter from './order/user.order.routes'

import {
	getSellerValidator,
	getProductsValidator,
	patchCartValidator
} from './user.validator'

import {
	getSellersInApartment,
	getProductsOfSeller,
	getUserCart,
	patchUserCart
} from './user.controller'

const router = Router()

router.use('/auth', authRouter)
router.use('/orders', orderRouter)

router.get(
	'/sellers/:apartmentId',
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

router.get('/cart', token.authenticationMiddleware, getUserCart)

router.patch(
	'/cart',
	token.authenticationMiddleware,
	patchCartValidator,
	validationMiddleware,
	patchUserCart
)

export default router
