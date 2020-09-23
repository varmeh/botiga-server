import {
	emptyValidator,
	pinValidator,
	otpValidator,
	phoneValidator,
	alphaNumericValidator,
	paramEmptyValidator,
	emptyOptionalValidator,
	alphaNumericOptionalValidator
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

export const postSigninPinValidator = [
	phoneValidator('phone'),
	pinValidator('pin')
]

export const postSignupValidator = [
	emptyValidator('firstName'),
	emptyValidator('lastName'),
	emptyValidator('gender')
		.matches(/^(male|female)$/, 'i')
		.withMessage('should be either male or female'),
	phoneValidator('phone'),
	pinValidator('pin'),
	emptyValidator('house'),
	alphaNumericValidator('apartmentId')
]

export const patchProfileValidator = [
	emptyOptionalValidator('firstName'),
	emptyOptionalValidator('lastName'),
	emptyOptionalValidator('gender')
		.matches(/^(male|female)$/, 'i')
		.withMessage('should be either male or female'),
	emptyOptionalValidator('house'),
	alphaNumericOptionalValidator('apartmentId')
]
