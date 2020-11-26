import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'
import {
	getOtpValidator,
	postOtpVerifyValidator,
	postSignupValidator,
	patchProfileValidator,
	patchAddressValidator,
	postAddressValidator,
	deleteAddressValidator,
	patchTokenRegisterValidator
} from './user.auth.validator'

import {
	getOtp,
	postVerifyOtp,
	postUserSignup,
	postUserSignout,
	getUserProfile,
	patchUserProfile,
	patchUserPushToken,
	getUserAddress,
	postUserAddress,
	patchUserAddress,
	deleteUserAddress
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
	'/token',
	token.authenticationMiddleware,
	patchTokenRegisterValidator,
	validationMiddleware,
	patchUserPushToken
)

router.get('/addresses', token.authenticationMiddleware, getUserAddress)

router.post(
	'/addresses',
	token.authenticationMiddleware,
	postAddressValidator,
	validationMiddleware,
	postUserAddress
)

router.patch(
	'/addresses',
	token.authenticationMiddleware,
	patchAddressValidator,
	validationMiddleware,
	patchUserAddress
)

router.delete(
	'/addresses/:id',
	token.authenticationMiddleware,
	deleteAddressValidator,
	validationMiddleware,
	deleteUserAddress
)

router.post('/signout', token.authenticationMiddleware, postUserSignout)

export default router
