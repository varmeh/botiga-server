import { Router } from 'express'

import { token, validationMiddleware } from '../../../util'

import {
	postOrderValidator,
	postProductsValidator,
	postCancelOrderValidator,
	getOrdersValidator,
	getOrderWithIdValidator,
	postTransactionValidator
} from './user.order.validator'

import {
	postOrder,
	postProductsValidate,
	postCancelOrder,
	getOrders,
	getOrderWithId,
	postRpayTransaction,
	postRpayTransactionCancelled,
	postRpayTransactionWebhook,
	postRpayDowntimeWebhook
} from './user.order.controller'

const router = Router()

router.get(
	'/',
	token.authenticationMiddleware,
	getOrdersValidator,
	validationMiddleware,
	getOrders
)

router.get(
	'/:orderId',
	token.authenticationMiddleware,
	getOrderWithIdValidator,
	validationMiddleware,
	getOrderWithId
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
	'/transaction/cancelled',
	token.authenticationMiddleware,
	postTransactionValidator,
	validationMiddleware,
	postRpayTransactionCancelled
)

router.post(
	'/transaction',
	token.authenticationMiddleware,
	postTransactionValidator,
	validationMiddleware,
	postRpayTransaction
)

router.post('/transaction/webhook', postRpayTransactionWebhook) // API Callback from paytm payment webview
router.post('/downtime/webhook', postRpayDowntimeWebhook)

export default router
