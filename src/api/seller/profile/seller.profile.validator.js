import {
	emptyOptionalValidator,
	phoneOptionalValidator,
	addressOptionalValidator,
	regexAlphaSpaceDigitsOptionalValidator,
	pinOptionalValidator,
	emailOptionalValidator
} from '../../../util'

export const patchContactValidator = [
	emailOptionalValidator('email'),
	phoneOptionalValidator('phone'),
	phoneOptionalValidator('whatsapp'),
	addressOptionalValidator('address.building'),
	addressOptionalValidator('address.street'),
	regexAlphaSpaceDigitsOptionalValidator('address.city'),
	regexAlphaSpaceDigitsOptionalValidator('address.area'),
	regexAlphaSpaceDigitsOptionalValidator('address.state'),
	pinOptionalValidator('address.pincode')
]

export const patchBusinessValidator = [
	emptyOptionalValidator('brandName'),
	emptyOptionalValidator('tagline'),
	emptyOptionalValidator('imageUrl').isURL({
		protocols: ['https']
	})
]
