import { Router } from 'express'

import { token, validationMiddleware } from '../../../util'

import {
	postCancelOrderValidator,
	patchDeliveryStatusValidator,
	patchDeliveryDelayValidator,
	getDeliveryValidator,
	getOrdersValidator,
	getOrdersAggregateValidator
} from './seller.order.validator'

import {
	postCancelOrder,
	patchDeliveryStatus,
	patchDeliveryDelay,
	getDeliveryByApartment,
	getOrdersByApartmentDate,
	getOrdersAggregate
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

router.get(
	'/delivery/:apartmentId',
	token.authenticationMiddleware,
	getDeliveryValidator,
	validationMiddleware,
	getDeliveryByApartment
)

router.get(
	'/:apartmentId/:date',
	token.authenticationMiddleware,
	getOrdersValidator,
	validationMiddleware,
	getOrdersByApartmentDate
)

router.get(
	'/aggregate/:date',
	token.authenticationMiddleware,
	getOrdersAggregateValidator,
	validationMiddleware,
	getOrdersAggregate
)

export default router
