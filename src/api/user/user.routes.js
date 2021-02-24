import { Router } from 'express'

import { token, validationMiddleware } from '../../util'

import authRouter from './auth/user.auth.routes'
import orderRouter from './order/user.order.routes'

import {
	paramApartmentIdValidator,
	paramSellerIdValidator,
	getCartValidator,
	patchCartValidator
} from './user.validator'

import {
	getSellersInApartment,
	getApartmentData,
	getProductsOfSeller,
	getSellerData,
	getUserCart,
	patchUserCart
} from './user.controller'

const router = Router()

router.use('/auth', authRouter)
router.use('/orders', orderRouter)

router.get(
	'/sellers/:apartmentId',
	paramApartmentIdValidator,
	validationMiddleware,
	getSellersInApartment
)

router.get(
	'/apartments/:apartmentId',
	paramApartmentIdValidator,
	validationMiddleware,
	getApartmentData
)

router.get(
	'/products/:sellerId',
	paramSellerIdValidator,
	validationMiddleware,
	getProductsOfSeller
)

router.get(
	'/sellers/data/:sellerId',
	paramSellerIdValidator,
	validationMiddleware,
	getSellerData
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
