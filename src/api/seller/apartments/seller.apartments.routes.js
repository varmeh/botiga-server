import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'

import {
	patchApartmentValidator,
	patchDeliveryValidator,
	patchContactInfoValidator,
	deleteApartmentValidator
} from './seller.apartments.validator'

import {
	getApartments,
	patchApartmentLive,
	patchDelierySchedule,
	patchContactInformation
} from './seller.apartments.controller'

const router = Router()

router.get('/', token.authenticationMiddleware, getApartments)

router.patch(
	'/live',
	token.authenticationMiddleware,
	patchApartmentValidator,
	validationMiddleware,
	patchApartmentLive
)

router.patch(
	'/delivery',
	token.authenticationMiddleware,
	patchDeliveryValidator,
	validationMiddleware,
	patchDelierySchedule
)

router.patch(
	'/contact',
	token.authenticationMiddleware,
	patchContactInfoValidator,
	validationMiddleware,
	patchContactInformation
)

router.delete(
	'/apartment/:apartmentId',
	token.authenticationMiddleware,
	deleteApartmentValidator,
	validationMiddleware
)

export default router
