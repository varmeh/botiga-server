import { Router } from 'express'

import { token, validationMiddleware } from '../../../util'

import {
	postCancelOrderValidator,
	patchOrderStatusValidator
} from './seller.order.validator'

import { postCancelOrder, patchOrderStatus } from './seller.order.controller'

const router = Router()

router.post(
	'/cancel',
	token.authenticationMiddleware,
	postCancelOrderValidator,
	validationMiddleware,
	postCancelOrder
)

router.patch(
	'/status',
	token.authenticationMiddleware,
	patchOrderStatusValidator,
	validationMiddleware,
	patchOrderStatus
)

export default router
