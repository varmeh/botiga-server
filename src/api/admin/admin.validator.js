import {
	emptyValidator,
	addressValidator,
	pincodeValidator,
	decimalValidator,
	regexAlphaSpaceDigitsValidator,
	objectIdValidator
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

export const postNotificationUserValidator = [
	objectIdValidator('userId'),
	emptyValidator('title'),
	emptyValidator('content')
]

export const postNotificationApartmentValidator = [
	objectIdValidator('apartmentId'),
	emptyValidator('title'),
	emptyValidator('content')
]
