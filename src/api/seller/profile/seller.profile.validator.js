import {
	phoneOptionalValidator,
	addressOptionalValidator,
	regexAlphaSpaceDigitsOptionalValidator,
	pincodeOptionalValidator,
	emailOptionalValidator,
	emptyValidator,
	boolValidator,
	alphaNumericValidator
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
	pincodeOptionalValidator('address.pincode')
]

export const patchBusinessValidator = [
	emptyValidator('brandName'),
	emptyValidator('tagline'),
	emptyValidator('imageUrl').isURL({
		protocols: ['https']
	}),
	boolValidator('updateImage')
]

export const patchBankDetailsValidator = [
	emptyValidator('beneficiaryName'),
	alphaNumericValidator('accountNumber'),
	alphaNumericValidator('ifscCode'),
	emptyValidator('bankName'),
	emptyValidator('accountType')
		.matches(/^(current|savings)$/, 'i')
		.withMessage('should be either current or savings')
]
