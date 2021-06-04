import { Router } from 'express'

import { validationMiddleware, token } from '../../../util'
import { getOtpValidator, postOtpVerifyValidator } from './admin.auth.validator'

import { getOtp, postVerifyOtp, postUserSignout } from './admin.auth.controller'

const router = Router()

router.get('/otp/:phone', getOtpValidator, validationMiddleware, getOtp)

router.post(
	'/otp/verify',
	postOtpVerifyValidator,
	validationMiddleware,
	postVerifyOtp
)

router.post('/signout', token.authenticationMiddleware, postUserSignout)

export default router
