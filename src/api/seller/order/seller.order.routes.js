import { Router } from 'express'

import { token, validationMiddleware } from '../../../util'

import { postCancelOrderValidator } from './seller.order.validator'

import { postCancelOrder } from './seller.order.controller'

const router = Router()

router.post(
	'/cancel',
	token.authenticationMiddleware,
	postCancelOrderValidator,
	validationMiddleware,
	postCancelOrder
)

export default router
