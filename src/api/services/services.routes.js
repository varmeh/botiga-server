import { Router } from 'express'
import { validationErrorHandler } from '../../util'
import {
	getApartmentsByLocation,
	getApartmentsByCity,
	getCities,
	getAreasForCity,
	postApartment
} from './services.controller'
import { apartmentValidator } from './services.validator'

const router = Router()

router.get('/apartments/location', getApartmentsByLocation)

router.get('/apartments', getApartmentsByCity)

router.get('/cities', getCities)

router.get('/areas/:city', getAreasForCity)

router.post(
	'/apartments',
	apartmentValidator,
	validationErrorHandler,
	postApartment
)

export default router
