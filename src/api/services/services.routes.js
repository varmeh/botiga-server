import { Router } from 'express'
import { token, validationMiddleware } from '../../util'
import { getImageUrlValidator } from './services.validator'

import {
	getApartmentsByLocation,
	getApartmentsByCityAndArea,
	getCities,
	getAreasForCity,
	getImageUrl,
	getApartmentsSearch
} from './services.controller'

const router = Router()

router.get('/apartments/location', getApartmentsByLocation)

router.get('/apartments', getApartmentsByCityAndArea)

router.get('/apartments/search', getApartmentsSearch)

router.get('/cities', getCities)

router.get('/areas/:city', getAreasForCity)

router.get(
	'/imageurls/:imageType',
	token.authenticationMiddleware,
	getImageUrlValidator,
	validationMiddleware,
	getImageUrl
)

router.get('/token/validate', token.authenticationMiddleware, (_, res) =>
	res.status(204).json()
)

export default router
