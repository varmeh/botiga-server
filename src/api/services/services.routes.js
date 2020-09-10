import { Router } from 'express'
import {
	getApartmentsByLocation,
	getApartmentsByCityAndArea,
	getCities,
	getAreasForCity
} from './services.controller'

const router = Router()

router.get('/apartments/location', getApartmentsByLocation)

router.get('/apartments', getApartmentsByCityAndArea)

router.get('/cities', getCities)

router.get('/areas/:city', getAreasForCity)

export default router
