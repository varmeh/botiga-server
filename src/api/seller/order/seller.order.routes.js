import { Router } from 'express'

import { token, validationMiddleware } from '../../../util'

import {
	postCancelOrderValidator,
	patchRefundCompletedValidator,
	getOrdersValidator,
	getOrdersAggregateValidator
} from './seller.order.validator'

import {
	postCancelOrder,
	patchRefundCompleted,
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
	'/refund/completed',
	token.authenticationMiddleware,
	patchRefundCompletedValidator,
	validationMiddleware,
	patchRefundCompleted
)

/*
 * Orders route should be before Orders for apartment route
 * As, Orders for apartment route is generic & accepts an open parameter
 */
router.get(
	'/aggregate/:date',
	token.authenticationMiddleware,
	getOrdersAggregateValidator,
	validationMiddleware,
	getOrdersAggregate
)

router.get(
	'/:apartmentId/:date',
	token.authenticationMiddleware,
	getOrdersValidator,
	validationMiddleware,
	getOrdersByApartmentDate
)

export default router
