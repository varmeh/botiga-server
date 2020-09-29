import {
	emptyValidator,
	pinValidator,
	otpValidator,
	phoneValidator,
	paramEmptyValidator,
	emptyOptionalValidator,
	objectIdValidator,
	objectIdOptionalValidator,
	emailOptionalValidator,
	phoneOptionalValidator
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
	phoneValidator('phone'),
	phoneValidator('whatsapp'),
	emailOptionalValidator('email'),
	pinValidator('pin'),
	emptyValidator('house'),
	objectIdValidator('apartmentId')
]

export const patchProfileValidator = [
	emptyOptionalValidator('firstName'),
	emptyOptionalValidator('lastName'),
	emptyOptionalValidator('house'),
	phoneOptionalValidator('whatsapp'),
	emailOptionalValidator('email'),
	objectIdOptionalValidator('apartmentId')
]

export const patchPinValidator = pinValidator('pin')
