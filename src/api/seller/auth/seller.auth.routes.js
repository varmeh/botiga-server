import { Router } from 'express'
import { validationErrorHandler } from '../../../util'
import { pinSigninValidator, signupValidator } from './seller.auth.validator'
import {
	postSellerSignup,
	postSellerLoginWithPin
} from './seller.auth.controller'

const router = Router()

router.post(
	'/signup',
	signupValidator,
	validationErrorHandler,
	postSellerSignup
)

router.post(
	'/signin/pin',
	pinSigninValidator,
	validationErrorHandler,
	postSellerLoginWithPin
)

export default router
