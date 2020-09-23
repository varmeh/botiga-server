import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'
import {
	getOtpValidator,
	postOtpVerifyValidator,
	postSigninPinValidator,
	postSignupValidator,
	patchProfileValidator,
	patchPinValidator
} from './user.auth.validator'
import {
	getOtp,
	postVerifyOtp,
	postUserSignup,
	postUserSigninPin,
	postUserSignout,
	patchUserProfile,
	patchUserPin
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

router.post(
	'/signin/pin',
	postSigninPinValidator,
	validationMiddleware,
	postUserSigninPin
)

router.patch(
	'/profile',
	token.authenticationMiddleware,
	patchProfileValidator,
	validationMiddleware,
	patchUserProfile
)

router.patch(
	'/pin',
	token.authenticationMiddleware,
	patchPinValidator,
	validationMiddleware,
	patchUserPin
)

router.post('/signout', token.authenticationMiddleware, postUserSignout)

export default router
