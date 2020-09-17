import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'

import {
	postApartmentValidator,
	patchApartmentValidator
} from './seller.apartments.validator'

import {
	getApartments,
	postApartments,
	patchApartmentLive
} from './seller.apartments.controller'

const router = Router()

router.get('/', token.authenticationMiddleware, getApartments)

router.post(
	'/',
	token.authenticationMiddleware,
	postApartmentValidator,
	validationMiddleware,
	postApartments
)

router.patch(
	'/live',
	token.authenticationMiddleware,
	patchApartmentValidator,
	validationMiddleware,
	patchApartmentLive
)

export default router
