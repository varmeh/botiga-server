import { Router } from 'express'
import {
	getApartmentsByLocation,
	getApartmentsByCity
} from './services.controller'

const router = Router()

router.get('/apartments/location', getApartmentsByLocation)

router.get('/apartments', getApartmentsByCity)

export default router
