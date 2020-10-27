import {
	emptyValidator,
	pinValidator,
	otpValidator,
	paramPhoneValidator,
	phoneValidator,
	objectIdValidator,
	addressValidator,
	emailOptionalValidator
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
	emailOptionalValidator('email')
]

export const patchProfileValidator = [
	emptyValidator('firstName'),
	emptyValidator('lastName'),
	phoneValidator('whatsapp'),
	emailOptionalValidator('email')
]

export const patchAddressValidator = [
	objectIdValidator('apartmentId'),
	addressValidator('house')
]

export const patchPinValidator = pinValidator('pin')

export const patchTokenRegisterValidator = [emptyValidator('token')]
