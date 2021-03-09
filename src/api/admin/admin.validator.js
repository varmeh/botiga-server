import {
	emptyValidator,
	emptyOptionalValidator,
	pincodeValidator,
	decimalValidator,
	urlValidator,
	objectIdValidator,
	paramPhoneValidator,
	paramDateValidator,
	boolOptionalValidator,
	phoneValidator,
	paramObjectIdValidator,
	boolValidator,
	numberValidator
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
	emptyValidator('content')
]

export const getSellerValidator = paramPhoneValidator('phone')

export const deleteSellerApartmentValidator = paramPhoneValidator('phone')

export const postSellerApartmentValidator = [
	phoneValidator('phone'),
	objectIdValidator('apartmentId')
]

export const patchSellerApartmentLiveValidator = [
	...postSellerApartmentValidator,
	boolValidator('live')
]

export const deleteSellerApartmentWithIdValidator = [
	paramPhoneValidator('phone'),
	paramObjectIdValidator('apartmentId')
]

export const patchSellerBankDetailsValidator = [
	phoneValidator('phone'),
	boolOptionalValidator('editable'),
	boolOptionalValidator('verified'),
	emptyOptionalValidator('mid')
]

export const postTestTransactionValidator = [
	phoneValidator('phone'),
	decimalValidator('txnAmount')
]

export const postTestTransactionNotifyValidator = [
	...postTestTransactionValidator,
	emptyValidator('paymentId')
]

export const getDeliveryValidator = [
	paramPhoneValidator('sellerPhone'),
	paramDateValidator('date')
]
