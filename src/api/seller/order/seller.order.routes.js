import { Router } from 'express'

import { token, validationMiddleware } from '../../../util'

import {
	postCancelOrderValidator,
	patchDeliveryStatusValidator,
	patchDeliveryDelayValidator
} from './seller.order.validator'

import {
	postCancelOrder,
	patchDeliveryStatus,
	patchDeliveryDelay
} from './seller.order.controller'

const router = Router()

router.post(
	'/cancel',
	token.authenticationMiddleware,
	postCancelOrderValidator,
	validationMiddleware,
	postCancelOrder
)

router.patch(
	'/delivery/status',
	token.authenticationMiddleware,
	patchDeliveryStatusValidator,
	validationMiddleware,
	patchDeliveryStatus
)

router.patch(
	'/delivery/delayed',
	token.authenticationMiddleware,
	patchDeliveryDelayValidator,
	validationMiddleware,
	patchDeliveryDelay
)

export default router
