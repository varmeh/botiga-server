import { Router } from 'express'
import { validationErrorHandler } from '../../util'
import { postApartment } from './admin.controller'
import { apartmentValidator } from './admin.validator'

const router = Router()

router.post(
	'/apartments',
	apartmentValidator,
	validationErrorHandler,
	postApartment
)

export default router
