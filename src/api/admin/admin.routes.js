import { Router } from 'express'
import { validationMiddleware } from '../../util'
import {
	apartmentValidator,
	postBusinessCategoryValidator
} from './admin.validator'
import { postApartment, postBusinessCategory } from './admin.controller'

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
export default router
