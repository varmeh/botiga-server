import {
	emptyValidator,
	paramPhoneValidator,
	phoneValidator,
	otpValidator,
	urlOptionalValidator,
	emptyOptionalValidator,
	dateOptionalValidator
} from '../../../util'

export const getOtpValidator = paramPhoneValidator('phone')

export const postOtpVerifyValidator = [
	phoneValidator('phone'),
	emptyValidator('sessionId'),
	otpValidator('otpVal')
]

export const postSignupValidator = [
	emptyValidator('businessName'),
	emptyValidator('firstName'),
	emptyValidator('lastName'),
	emptyValidator('brandName'),
	emptyValidator('businessCategory'),
	emptyValidator('businessType'),
	emptyValidator('gstin'),
	emptyOptionalValidator('fssaiNumber'),
	dateOptionalValidator('fssaiValidityDate'),
	emptyOptionalValidator('fssaiCertificateUrl'),
	urlOptionalValidator('brandUrl'),
	emptyOptionalValidator('tagline'),
	phoneValidator('phone'),
	emptyValidator('createToken')
]

export const patchTokenRegisterValidator = [emptyValidator('token')]
