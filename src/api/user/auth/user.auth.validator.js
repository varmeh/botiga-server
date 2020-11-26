import {
	emptyValidator,
	otpValidator,
	paramPhoneValidator,
	phoneValidator,
	objectIdValidator,
	addressValidator,
	emailOptionalValidator,
	phoneOptionalValidator,
	paramObjectIdValidator
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
	emailOptionalValidator('email'),
	emptyValidator('createToken')
]

export const patchProfileValidator = [
	emptyValidator('firstName'),
	emptyValidator('lastName'),
	phoneOptionalValidator('whatsapp'),
	emailOptionalValidator('email')
]

export const patchTokenRegisterValidator = [emptyValidator('token')]

export const postAddressValidator = [
	objectIdValidator('apartmentId'),
	addressValidator('house')
]

export const patchAddressValidator = [
	objectIdValidator('id'),
	addressValidator('house')
]

export const deleteAddressValidator = [paramObjectIdValidator('id')]
