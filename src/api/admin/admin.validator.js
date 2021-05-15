import {
	emptyValidator,
	pincodeValidator,
	decimalValidator,
	urlValidator,
	objectIdValidator,
	paramPhoneValidator,
	paramNumberValidator,
	phoneValidator,
	paramObjectIdValidator,
	numberValidator,
	urlOptionalValidator,
	objectIdOptionalValidator
} from '../../util'

export const getApartmentValidator = paramObjectIdValidator('apartmentId')

export const postApartmentValidator = [
	emptyValidator('name'),
	emptyValidator('city'),
	emptyValidator('area'),
	emptyValidator('state'),
	pincodeValidator('pincode'),
	decimalValidator('location.lat'),
	decimalValidator('location.long')
]

export const postApartmentBannerValidator = [
	objectIdValidator('apartmentId'),
	urlValidator('bannerUrl'),
	objectIdValidator('sellerId'),
	numberValidator('position')
		.bail()
		.custom(val => val >= 1 && val <= 5)
		.withMessage('position should be in range 1 to 5')
]

export const deleteApartmentBannerValidator = [
	paramObjectIdValidator('apartmentId'),
	paramObjectIdValidator('bannerId')
]

export const deleteImageValidator = urlValidator('imageUrl')

export const postBusinessCategoryValidator = [emptyValidator('category')]

export const postNotificationUserValidator = [
	objectIdValidator('id'),
	emptyValidator('title'),
	emptyValidator('content')
]

export const postNotificationTopicValidator = [
	emptyValidator('topic'),
	emptyValidator('title'),
	emptyValidator('content'),
	urlOptionalValidator('imageUrl'),
	objectIdOptionalValidator('sellerId')
]

export const postTestTransactionValidator = [
	phoneValidator('phone'),
	decimalValidator('txnAmount')
]

export const postTestTransactionNotifyValidator = [
	...postTestTransactionValidator,
	emptyValidator('paymentId')
]

export const getOrdersByPhoneValidator = [paramPhoneValidator('number')]

export const getOrdersByOrderNumberValidator = [paramNumberValidator('number')]
