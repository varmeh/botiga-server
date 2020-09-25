import { Router } from 'express'

import { token, validationMiddleware } from '../../../util'

import { postOrderValidator } from './user.order.validator'

import { postOrder } from './user.order.controller'

const router = Router()

router.post(
	'/',
	token.authenticationMiddleware,
	postOrderValidator,
	validationMiddleware,
	postOrder
)

export default router
