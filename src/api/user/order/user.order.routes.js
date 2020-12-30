import { Router } from 'express'

import { token, validationMiddleware } from '../../../util'

import {
	postOrderValidator,
	postProductsValidator,
	postCancelOrderValidator,
	getOrdersValidator,
	postTransactionValidator
} from './user.order.validator'

import {
	postOrder,
	postProductsValidate,
	postCancelOrder,
	getOrders,
	postTransaction,
	postTransactionStatus,
	postRpayTransaction,
	postRpayTransactionWebhook
} from './user.order.controller'

const router = Router()

router.get(
	'/',
	token.authenticationMiddleware,
	getOrdersValidator,
	validationMiddleware,
	getOrders
)

// Create a new order & initiate transaction
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

/* Transaction APIs */
router.post(
	'/transaction',
	token.authenticationMiddleware,
	postTransactionValidator,
	validationMiddleware,
	postTransaction
)

router.post(
	'/transaction/rpay',
	token.authenticationMiddleware,
	postTransactionValidator,
	validationMiddleware,
	postRpayTransaction
)

router.post('/transaction/status', postTransactionStatus) // API Callback from paytm payment webview

router.post('/transaction/webhook', postRpayTransactionWebhook) // API Callback from paytm payment webview

export default router
