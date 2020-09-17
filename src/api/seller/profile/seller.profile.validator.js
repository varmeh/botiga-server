import {
	emptyOptionalValidator,
	phoneOptionalValidator,
	addressOptionalValidator,
	alphaSpaceOptionalValidator,
	pinOptionalValidator
} from '../../../util'

export const patchContactValidator = [
	emptyOptionalValidator('email')
		.isEmail()
		.withMessage('should be a valid email Id'),
	phoneOptionalValidator('phone'),
	phoneOptionalValidator('whatsapp'),
	addressOptionalValidator('building'),
	addressOptionalValidator('street'),
	alphaSpaceOptionalValidator('city'),
	alphaSpaceOptionalValidator('area'),
	alphaSpaceOptionalValidator('state'),
	pinOptionalValidator('pincode')
]
