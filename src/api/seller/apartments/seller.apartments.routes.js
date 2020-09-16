import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'

import { postApartmentValidator } from './seller.apartments.validator'

import { getApartments, postApartments } from './seller.apartments.controller'

const router = Router()

router.get('/', token.authenticationMiddleware, getApartments)

router.post(
	'/',
	token.authenticationMiddleware,
	postApartmentValidator,
	validationMiddleware,
	postApartments
)

export default router
