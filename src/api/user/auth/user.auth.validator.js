import {
	emptyValidator,
	pinValidator,
	otpValidator,
	paramPhoneValidator,
	phoneValidator,
	emptyOptionalValidator,
	objectIdValidator,
	objectIdOptionalValidator,
	emailOptionalValidator,
	phoneOptionalValidator
} from '../../../util'

export const getOtpValidator = paramPhoneValidator('phone')

export const postOtpVerifyValidator = [
	phoneValidator('phone'),
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
