import {
	emptyValidator,
	addressValidator,
	pincodeValidator,
	decimalValidator,
	regexAlphaSpaceDigitsValidator,
	objectIdValidator,
	paramPhoneValidator,
	paramDateValidator,
	boolOptionalValidator,
	regexAlphaSpaceDigitsOptionalValidator,
	phoneValidator
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

export const getSellerValidator = paramPhoneValidator('phone')

export const patchSellerBankDetailsValidator = [
	phoneValidator('phone'),
	boolOptionalValidator('editable'),
	boolOptionalValidator('verified'),
	regexAlphaSpaceDigitsOptionalValidator('mid')
]

export const postTestTransactionValidator = [
	phoneValidator('phone'),
	decimalValidator('txnAmount')
]

export const getDeliveryValidator = [
	paramPhoneValidator('sellerPhone'),
	paramDateValidator('date')
]
