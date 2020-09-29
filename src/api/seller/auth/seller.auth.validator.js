import {
	emptyValidator,
	alphaValidator,
	pinValidator,
	phoneValidator,
	paramEmptyValidator,
	otpValidator
} from '../../../util'

export const getOtpValidator = paramEmptyValidator('phone')
	.bail()
	.matches(/^9\d{9}$/)
	.withMessage('should be a valid phone number')

export const postOtpVerifyValidator = [
	emptyValidator('phone')
		.bail()
		.matches(/^9\d{9}$/)
		.withMessage('should be a valid phone number'),
	emptyValidator('sessionId'),
	otpValidator('otpVal')
]

export const postPinSigninValidator = [
	phoneValidator('phone'),
	pinValidator('pin')
]

export const patchPinValidator = pinValidator('pin')

export const postSignupValidator = [
	emptyValidator('companyName'),
	alphaValidator('businessCategory'),
	emptyValidator('firstName'),
	emptyValidator('lastName'),
	emptyValidator('brandName'),
	phoneValidator('phone'),
	pinValidator('pin')
]
