import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'
import {
	getOtpValidator,
	postOtpVerifyValidator,
	postPinSigninValidator,
	patchPinValidator,
	postSignupValidator,
	patchTokenRegisterValidator
} from './seller.auth.validator'
import {
	getOtp,
	postVerifyOtp,
	postSellerSignup,
	postSellerLoginWithPin,
	postSellerSignout,
	patchUserPin,
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

router.post(
	'/signin/pin',
	postPinSigninValidator,
	validationMiddleware,
	postSellerLoginWithPin
)

router.patch(
	'/pin',
	token.authenticationMiddleware,
	patchPinValidator,
	validationMiddleware,
	patchUserPin
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
