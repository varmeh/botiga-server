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
	addressOptionalValidator('address.building'),
	addressOptionalValidator('address.street'),
	alphaSpaceOptionalValidator('address.city'),
	alphaSpaceOptionalValidator('address.area'),
	alphaSpaceOptionalValidator('address.state'),
	pinOptionalValidator('address.pincode')
]
