import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'
import { pinSigninValidator, signupValidator } from './seller.auth.validator'
import {
	postSellerSignup,
	postSellerLoginWithPin,
	postSellerSignout
} from './seller.auth.controller'

const router = Router()

router.post('/signup', signupValidator, validationMiddleware, postSellerSignup)

router.post(
	'/signin/pin',
	pinSigninValidator,
	validationMiddleware,
	postSellerLoginWithPin
)

router.post('/signout', token.authenticationMiddleware, postSellerSignout)

export default router
