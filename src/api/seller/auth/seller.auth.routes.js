import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'
import {
	getOtpValidator,
	postOtpVerifyValidator,
	postSignupValidator,
	patchTokenRegisterValidator
} from './seller.auth.validator'
import {
	getOtp,
	postVerifyOtp,
	postSellerSignup,
	postSellerSignout,
	patchPushToken
} from './seller.auth.controller'

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
	postSellerSignup
)

router.patch(
	'/token',
	token.authenticationMiddleware,
	patchTokenRegisterValidator,
	validationMiddleware,
	patchPushToken
)

router.post('/signout', token.authenticationMiddleware, postSellerSignout)

export default router
