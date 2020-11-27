import { Router } from 'express'

import { token, validationMiddleware } from '../../util'

import authRouter from './auth/user.auth.routes'
import orderRouter from './order/user.order.routes'

import {
	getSellerValidator,
	getProductsValidator,
	getCartValidator,
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
	getSellerValidator,
	validationMiddleware,
	getSellersInApartment
)

router.get(
	'/products/:sellerId',
	getProductsValidator,
	validationMiddleware,
	getProductsOfSeller
)

router.get(
	'/cart/:addressId',
	token.authenticationMiddleware,
	getCartValidator,
	validationMiddleware,
	getUserCart
)

router.patch(
	'/cart',
	token.authenticationMiddleware,
	patchCartValidator,
	validationMiddleware,
	patchUserCart
)

export default router
