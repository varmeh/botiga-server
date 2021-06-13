import { DeliveryType } from '../../../models'

import {
	emptyValidator,
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

export const patchDeliveryScheduleValidator = [
	phoneValidator('phone'),
	objectIdValidator('apartmentId'),
	emptyValidator('deliveryType')
		.isIn([DeliveryType.duration, DeliveryType.weeklySchedule])
		.withMessage('should be either duration or weeklySchedule'),
	numberValidator('day')
		.custom(val => val >= 1 && val <= 7)
		.withMessage('day should be in range 1-7'),
	boolValidator('weekly.sun'),
	boolValidator('weekly.mon'),
	boolValidator('weekly.tue'),
	boolValidator('weekly.wed'),
	boolValidator('weekly.thu'),
	boolValidator('weekly.fri'),
	boolValidator('weekly.sat'),
	emptyOptionalValidator('slot')
]

export const patchSellerFiltesValidator = [
	phoneValidator('phone'),
	arrayValidator('filters')
]

export const deleteSellerApartmentValidator = paramPhoneValidator('phone')

export const postSellerApartmentValidator = [
	...patchDeliveryScheduleValidator,
	numberValidator('deliveryMinOrder')
		.bail()
		.custom(val => val <= 1000)
		.withMessage('should be at max ₹1000'),
	numberValidator('deliveryFee')
		.bail()
		.custom(val => val <= 50)
		.withMessage('should be at max 50')
]

export const postSellerApartmentConfigureValidator = [
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
