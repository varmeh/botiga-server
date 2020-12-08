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
	postTransactionStatus
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
	'/transaction/retry',
	token.authenticationMiddleware,
	postTxnRetryValidator,
	validationMiddleware,
	postTransactionRetry
)

router.post('/transaction/status', postTransactionStatus) // API Callback from paytm payment webview

export default router
