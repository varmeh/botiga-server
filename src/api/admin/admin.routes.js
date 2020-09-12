import { Router } from 'express'
import { validationMiddleware } from '../../util'
import { postApartment } from './admin.controller'
import { apartmentValidator } from './admin.validator'

const router = Router()

router.post(
	'/apartments',
	apartmentValidator,
	validationMiddleware,
	postApartment
)

export default router
