import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'
import {
	getOtpValidator,
	postOtpVerifyValidator,
	pinSigninValidator,
	signupValidator
} from './seller.auth.validator'
import {
	getOtp,
	postVerifyOtp,
	postSellerSignup,
	postSellerLoginWithPin,
	postSellerSignout
} from './seller.auth.controller'

const router = Router()

router.get('/otp/:phone', getOtpValidator, validationMiddleware, getOtp)
router.post(
	'/otp/verify',
	postOtpVerifyValidator,
	validationMiddleware,
	postVerifyOtp
)

router.post('/signup', signupValidator, validationMiddleware, postSellerSignup)

router.post(
	'/signin/pin',
	pinSigninValidator,
	validationMiddleware,
	postSellerLoginWithPin
)

router.post('/signout', token.authenticationMiddleware, postSellerSignout)

export default router
