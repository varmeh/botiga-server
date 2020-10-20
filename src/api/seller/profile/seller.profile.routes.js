import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'
import {
	patchContactValidator,
	patchBusinessValidator
} from './seller.profile.validator'
import {
	getProfileInformation,
	getContactInformation,
	patchContactInformation,
	getBusinessInformation,
	patchBusinessInformation
} from './seller.profile.controller'

const router = Router()

router.get('/', token.authenticationMiddleware, getProfileInformation)

router.get('/contact', token.authenticationMiddleware, getContactInformation)

router.patch(
	'/contact',
	token.authenticationMiddleware,
	patchContactValidator,
	validationMiddleware,
	patchContactInformation
)

router.get('/business', token.authenticationMiddleware, getBusinessInformation)

router.patch(
	'/business',
	token.authenticationMiddleware,
	patchBusinessValidator,
	validationMiddleware,
	patchBusinessInformation
)

export default router
