import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'
import { patchContactValidator } from './seller.profile.validator'
import { patchContact } from './seller.profile.controller'

const router = Router()

router.patch(
	'/contact',
	token.authenticationMiddleware,
	patchContactValidator,
	validationMiddleware,
	patchContact
)

export default router
