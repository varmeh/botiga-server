import { Router } from 'express'

import { token, validationMiddleware } from '../../../util'

import {
	patchDeliveryStatusValidator,
	patchDeliveryDelayValidator,
	getDeliveryValidator
} from './seller.delivery.validator'

import {
	patchDeliveryStatus,
	patchDeliveryDelay,
	getDeliveryByApartment
} from './seller.delivery.controller'

const router = Router()

router.patch(
	'/status',
	token.authenticationMiddleware,
	patchDeliveryStatusValidator,
	validationMiddleware,
	patchDeliveryStatus
)

router.patch(
	'/delayed',
	token.authenticationMiddleware,
	patchDeliveryDelayValidator,
	validationMiddleware,
	patchDeliveryDelay
)

router.get(
	'/:apartmentId/:date',
	token.authenticationMiddleware,
	getDeliveryValidator,
	validationMiddleware,
	getDeliveryByApartment
)

export default router
