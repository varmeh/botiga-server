import {
	emptyOptionalValidator,
	phoneOptionalValidator,
	addressOptionalValidator,
	alphaSpaceOptionalValidator,
	pinOptionalValidator,
	emailOptionalValidator
} from '../../../util'

export const patchContactValidator = [
	emailOptionalValidator('email'),
	phoneOptionalValidator('phone'),
	phoneOptionalValidator('whatsapp'),
	addressOptionalValidator('address.building'),
	addressOptionalValidator('address.street'),
	alphaSpaceOptionalValidator('address.city'),
	alphaSpaceOptionalValidator('address.area'),
	alphaSpaceOptionalValidator('address.state'),
	pinOptionalValidator('address.pincode')
]

export const patchBusinessValidator = [
	emptyOptionalValidator('brandName'),
	emptyOptionalValidator('tagline'),
	emptyOptionalValidator('imageUrl').isURL({
		protocols: ['https']
	})
]
