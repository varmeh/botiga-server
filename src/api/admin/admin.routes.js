import { Router } from 'express'
import { validationMiddleware } from '../../util'
import {
	apartmentValidator,
	postBusinessCategoryValidator,
	postNotificationApartmentValidator,
	postNotificationUserValidator
} from './admin.validator'
import {
	postApartment,
	postBusinessCategory,
	postNotificationApartment,
	postNotificationUser
} from './admin.controller'

const router = Router()

router.post(
	'/apartments',
	apartmentValidator,
	validationMiddleware,
	postApartment
)

router.post(
	'/businessCategory',
	postBusinessCategoryValidator,
	validationMiddleware,
	postBusinessCategory
)

router.post(
	'/notification/apartment',
	postNotificationApartmentValidator,
	validationMiddleware,
	postNotificationApartment
)

router.post(
	'/notification/user',
	postNotificationUserValidator,
	validationMiddleware,
	postNotificationUser
)

export default router
