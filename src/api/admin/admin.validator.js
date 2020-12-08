import {
	emptyValidator,
	addressValidator,
	pincodeValidator,
	decimalValidator,
	regexAlphaSpaceDigitsValidator,
	objectIdValidator,
	paramPhoneValidator,
	emptyOptionalValidator
} from '../../util'

export const postApartmentValidator = [
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
	objectIdValidator('id'),
	emptyValidator('title'),
	emptyValidator('content')
]

export const postNotificationTopicValidator = [
	emptyValidator('topic'),
	emptyValidator('title'),
	emptyValidator('content')
]

export const getSellerDetailsValidator = paramPhoneValidator('phone')

export const postPaymentUpdateValidator = emptyValidator('paymentId')
