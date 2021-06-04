import {
	emptyValidator,
	otpValidator,
	paramPhoneValidator,
	phoneValidator
} from '../../../util'

export const getOtpValidator = paramPhoneValidator('phone')

export const postOtpVerifyValidator = [
	phoneValidator('phone'),
	emptyValidator('sessionId'),
	otpValidator('otpVal')
]
