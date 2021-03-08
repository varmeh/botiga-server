import { Router } from 'express'

import { token, validationMiddleware } from '../../../util'

import {
	patchDeliveryStatusValidator,
	patchDeliveryDelayValidator,
	getDeliveryValidator,
	getAggregateDeliveryValidator,
	patchBatchDeliveryStatusValidator
} from './seller.delivery.validator'

import {
	patchDeliveryStatus,
	patchBatchDeliveryStatus,
	patchDeliveryDelay,
	getDeliveryByApartment,
	getAggregateDelivery
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
	'/batch/status',
	token.authenticationMiddleware,
	patchBatchDeliveryStatusValidator,
	validationMiddleware,
	patchBatchDeliveryStatus
)

router.patch(
	'/delayed',
	token.authenticationMiddleware,
	patchDeliveryDelayValidator,
	validationMiddleware,
	patchDeliveryDelay
)

// Aggregate api should be on top of per apartment api
// Else the per apartment delivery api being generic in nature would assume aggregate as a objectId parameter & throw a validation error
router.get(
	'/aggregate/:date',
	token.authenticationMiddleware,
	getAggregateDeliveryValidator,
	validationMiddleware,
	getAggregateDelivery
)

router.get(
	'/:apartmentId/:date',
	token.authenticationMiddleware,
	getDeliveryValidator,
	validationMiddleware,
	getDeliveryByApartment
)

export default router
