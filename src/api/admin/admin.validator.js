import {
	emptyValidator,
	addressValidator,
	pincodeValidator,
	decimalValidator,
	regexAlphaSpaceDigitsValidator
} from '../../util'

export const apartmentValidator = [
	addressValidator('name'),
	regexAlphaSpaceDigitsValidator('city'),
	regexAlphaSpaceDigitsValidator('area'),
	regexAlphaSpaceDigitsValidator('state'),
	pincodeValidator('pincode'),
	decimalValidator('location.lat'),
	decimalValidator('location.long')
]

export const postBusinessCategoryValidator = [emptyValidator('category')]
