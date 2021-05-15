import {
	emptyOptionalValidator,
	numberValidator,
	objectIdValidator,
	paramPhoneValidator,
	boolOptionalValidator,
	phoneValidator,
	paramObjectIdValidator,
	paramDateValidator,
	boolValidator,
	arrayValidator
} from '../../../util'

export const getSellerValidator = paramPhoneValidator('phone')

export const getDeliveryValidator = [
	paramPhoneValidator('sellerPhone'),
	paramDateValidator('date')
]

export const patchDeliveryFeeValidator = [
	phoneValidator('phone'),
	objectIdValidator('apartmentId'),
	numberValidator('deliveryMinOrder')
		.bail()
		.custom(val => val <= 1000)
		.withMessage('should be at max ₹1000'),
	numberValidator('deliveryFee')
		.bail()
		.custom(val => val <= 50)
		.withMessage('should be at max 50')
]

export const patchSellerFiltesValidator = [
	phoneValidator('phone'),
	arrayValidator('filters')
]

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
