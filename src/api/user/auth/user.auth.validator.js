import {
	emptyValidator,
	otpValidator,
	paramPhoneValidator,
	phoneValidator,
	objectIdValidator,
	addressValidator,
	emailOptionalValidator,
	phoneOptionalValidator
} from '../../../util'

export const getOtpValidator = paramPhoneValidator('phone')

export const postOtpVerifyValidator = [
	phoneValidator('phone'),
	emptyValidator('sessionId'),
	otpValidator('otpVal')
]

export const postSignupValidator = [
	emptyValidator('firstName'),
	emptyValidator('lastName'),
	phoneValidator('phone'),
	phoneOptionalValidator('whatsapp'),
	emailOptionalValidator('email')
]

export const patchProfileValidator = [
	emptyValidator('firstName'),
	emptyValidator('lastName'),
	phoneOptionalValidator('whatsapp'),
	emailOptionalValidator('email')
]

export const patchAddressValidator = [
	objectIdValidator('apartmentId'),
	addressValidator('house')
]

export const patchTokenRegisterValidator = [emptyValidator('token')]
