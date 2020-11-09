import { Router } from 'express'

import { token, validationMiddleware } from '../../../util'

import {
	postOrderValidator,
	postProductsValidator,
	postCancelOrderValidator,
	getOrdersValidator,
	postTxnRetryValidator
} from './user.order.validator'

import {
	postOrder,
	postProductsValidate,
	postCancelOrder,
	getOrders,
	postTransactionRetry,
	postTransactionStatus,
	postTransactionWebhook
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
	'/transaction/retry',
	token.authenticationMiddleware,
	postTxnRetryValidator,
	validationMiddleware,
	postTransactionRetry
)

// API Callback from paytm payment webview
router.post('/transaction/status', postTransactionStatus)
router.post('/transaction/webhook', postTransactionWebhook)

export default router
