import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'
import { signinPinValidator, signupValidator } from './user.auth.validator'
import {
	postUserSignup,
	postUserSigninPin,
	postUserSignout
} from './user.auth.controller'

const router = Router()

router.post('/signup', signupValidator, validationMiddleware, postUserSignup)

router.post(
	'/signin/pin',
	signinPinValidator,
	validationMiddleware,
	postUserSigninPin
)

router.post('/signout', token.authenticationMiddleware, postUserSignout)

export default router
