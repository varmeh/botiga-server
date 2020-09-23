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

export const pinSigninValidator = [phoneValidator('phone'), pinValidator('pin')]

export const signupValidator = [
	emptyValidator('companyName'),
	alphaValidator('businessCategory'),
	emptyValidator('firstName'),
	emptyValidator('lastName'),
	emptyValidator('gender')
		.matches(/^(male|female)$/, 'i')
		.withMessage('should be either male or female'),
	emptyValidator('brandName'),
	phoneValidator('phone'),
	pinValidator('pin')
]
