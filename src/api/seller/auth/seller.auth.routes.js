import { Router } from 'express'
import { validationMiddleware } from '../../../util'
import { pinSigninValidator, signupValidator } from './seller.auth.validator'
import {
	postSellerSignup,
	postSellerLoginWithPin
} from './seller.auth.controller'

const router = Router()

router.post('/signup', signupValidator, validationMiddleware, postSellerSignup)

router.post(
	'/signin/pin',
	pinSigninValidator,
	validationMiddleware,
	postSellerLoginWithPin
)

export default router
