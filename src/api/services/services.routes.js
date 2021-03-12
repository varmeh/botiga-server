import { Router } from 'express'
import { token, validationMiddleware } from '../../util'
import {
	getImageUrlValidator,
	getApartmentValidator,
	postImageUrlValidator
} from './services.validator'

import {
	getApartmentById,
	getApartmentsByLocation,
	getCities,
	getAreasForCity,
	getImageUrl,
	getBrandImageUrl,
	getPdfUrl,
	getApartmentsSearch,
	getBusinessCategory,
	getSellerFilters,
	postImageDelete
} from './services.controller'

const router = Router()

router.get('/apartments/location', getApartmentsByLocation)

router.get('/apartments/search', getApartmentsSearch)

// This one should be below all other apartment apis
router.get(
	'/apartments/:apartmentId',
	getApartmentValidator,
	validationMiddleware,
	getApartmentById
)

router.get('/cities', getCities)

router.get('/areas/:city', getAreasForCity)

router.get('/businessCategory', getBusinessCategory)

router.get('/sellerFilters', getSellerFilters)

router.get(
	'/imageurls/:imageType',
	token.authenticationMiddleware,
	getImageUrlValidator,
	validationMiddleware,
	getImageUrl
)

router.get(
	'/brandimageurls/:imageType',
	getImageUrlValidator,
	validationMiddleware,
	getBrandImageUrl
)

router.get('/url/pdf', getPdfUrl)

router.get('/token/validate', token.authenticationMiddleware, (_, res) =>
	res.status(204).json()
)

router.post(
	'/image/delete',
	token.authenticationMiddleware,
	postImageUrlValidator,
	validationMiddleware,
	postImageDelete
)

export default router
