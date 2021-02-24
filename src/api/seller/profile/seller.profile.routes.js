import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'
import {
	patchContactValidator,
	patchBusinessValidator,
	patchBankDetailsValidator,
	patchBannersValidator
} from './seller.profile.validator'
import {
	getProfileInformation,
	getContactInformation,
	patchContactInformation,
	getBusinessInformation,
	patchBusinessInformation,
	getBankDetails,
	patchBankDetails,
	getBanners,
	patchBanners
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

router.get('/bankdetails', token.authenticationMiddleware, getBankDetails)

router.patch(
	'/bankdetails',
	token.authenticationMiddleware,
	patchBankDetailsValidator,
	validationMiddleware,
	patchBankDetails
)

router.get('/banners', token.authenticationMiddleware, getBanners)

router.patch(
	'/banners',
	token.authenticationMiddleware,
	patchBannersValidator,
	validationMiddleware,
	patchBanners
)

export default router
