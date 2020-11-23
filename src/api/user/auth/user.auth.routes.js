import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'
import {
	getOtpValidator,
	postOtpVerifyValidator,
	postSignupValidator,
	patchProfileValidator,
	patchAddressValidator,
	patchTokenRegisterValidator
} from './user.auth.validator'

import {
	getOtp,
	postVerifyOtp,
	postUserSignup,
	postUserSignout,
	getUserProfile,
	patchUserProfile,
	patchUserAddress,
	patchUserPushToken
} from './user.auth.controller'

const router = Router()

router.get('/otp/:phone', getOtpValidator, validationMiddleware, getOtp)
router.post(
	'/otp/verify',
	postOtpVerifyValidator,
	validationMiddleware,
	postVerifyOtp
)

router.post(
	'/signup',
	postSignupValidator,
	validationMiddleware,
	postUserSignup
)

router.get('/profile', token.authenticationMiddleware, getUserProfile)

router.patch(
	'/profile',
	token.authenticationMiddleware,
	patchProfileValidator,
	validationMiddleware,
	patchUserProfile
)

router.patch(
	'/address',
	token.authenticationMiddleware,
	patchAddressValidator,
	validationMiddleware,
	patchUserAddress
)

router.patch(
	'/token',
	token.authenticationMiddleware,
	patchTokenRegisterValidator,
	validationMiddleware,
	patchUserPushToken
)

router.post('/signout', token.authenticationMiddleware, postUserSignout)

export default router
