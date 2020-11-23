import {
	emptyValidator,
	regexAlphaSpaceDigitsValidator,
	pinValidator,
	paramPhoneValidator,
	phoneValidator,
	otpValidator,
	urlOptionalValidator,
	emptyOptionalValidator
} from '../../../util'

export const getOtpValidator = paramPhoneValidator('phone')

export const postOtpVerifyValidator = [
	phoneValidator('phone'),
	emptyValidator('sessionId'),
	otpValidator('otpVal')
]

export const postPinSigninValidator = [
	phoneValidator('phone'),
	pinValidator('pin')
]

export const patchPinValidator = pinValidator('pin')

export const postSignupValidator = [
	emptyValidator('businessName'),
	emptyValidator('firstName'),
	emptyValidator('lastName'),
	emptyValidator('brandName'),
	regexAlphaSpaceDigitsValidator('businessCategory'),
	urlOptionalValidator('brandUrl'),
	emptyOptionalValidator('tagline'),
	phoneValidator('phone'),
	emptyValidator('createToken')
]

export const patchTokenRegisterValidator = [emptyValidator('token')]
