import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'
import { patchContactValidator } from './seller.profile.validator'
import {
	getContactInformation,
	patchContactInformation
} from './seller.profile.controller'

const router = Router()

router.get('/contact', token.authenticationMiddleware, getContactInformation)

router.patch(
	'/contact',
	token.authenticationMiddleware,
	patchContactValidator,
	validationMiddleware,
	patchContactInformation
)

export default router
