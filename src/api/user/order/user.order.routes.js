import { Router } from 'express'

import { token, validationMiddleware } from '../../../util'

import {
	postOrderValidator,
	postProductsValidator,
	postCancelOrderValidator,
	getOrdersValidator,
	postTxnInitiateValidator
} from './user.order.validator'

import {
	postOrder,
	postProductsValidate,
	postCancelOrder,
	getOrders,
	postInitiateTransaction
} from './user.order.controller'

const router = Router()

router.post(
	'/',
	token.authenticationMiddleware,
	postOrderValidator,
	validationMiddleware,
	postOrder
)

router.post(
	'/validate',
	token.authenticationMiddleware,
	postProductsValidator,
	validationMiddleware,
	postProductsValidate
)

router.post(
	'/cancel',
	token.authenticationMiddleware,
	postCancelOrderValidator,
	validationMiddleware,
	postCancelOrder
)

router.get(
	'/',
	token.authenticationMiddleware,
	getOrdersValidator,
	validationMiddleware,
	getOrders
)

router.post(
	'/transaction/initiate',
	token.authenticationMiddleware,
	postTxnInitiateValidator,
	validationMiddleware,
	postInitiateTransaction
)

export default router
