import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'

import {
	patchApartmentValidator,
	patchAllApartmentsLiveValidator,
	patchDeliveryValidator,
	patchContactInfoValidator,
	deleteApartmentValidator
} from './seller.apartments.validator'

import {
	getApartments,
	patchApartmentLive,
	patchAllApartmentsLive,
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
	'/all/live',
	token.authenticationMiddleware,
	patchAllApartmentsLiveValidator,
	validationMiddleware,
	patchAllApartmentsLive
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
