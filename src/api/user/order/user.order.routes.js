import { Router } from 'express'

import { token, validationMiddleware } from '../../../util'

import {
	postOrderValidator,
	postProductsValidator
} from './user.order.validator'

import { postOrder, postProductsValidate } from './user.order.controller'

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

export default router
