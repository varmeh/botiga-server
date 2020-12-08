import {
	phoneOptionalValidator,
	regexAlphaSpaceDigitsOptionalValidator,
	pincodeOptionalValidator,
	emailOptionalValidator,
	emptyValidator,
	boolValidator,
	alphaNumericValidator,
	emptyOptionalValidator,
	urlOptionalValidator
} from '../../../util'

export const patchContactValidator = [
	emailOptionalValidator('email'),
	phoneOptionalValidator('phone'),
	phoneOptionalValidator('whatsapp'),
	emptyOptionalValidator('address.building'),
	emptyOptionalValidator('address.street'),
	regexAlphaSpaceDigitsOptionalValidator('address.city'),
	emptyOptionalValidator('address.area'),
	regexAlphaSpaceDigitsOptionalValidator('address.state'),
	pincodeOptionalValidator('address.pincode')
]

export const patchBusinessValidator = [
	emptyValidator('brandName'),
	emptyValidator('tagline'),
	urlOptionalValidator('imageUrl'),
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
