import {
	emptyValidator,
	objectIdValidator,
	paramObjectIdValidator,
	paramDateValidator,
	dateValidator,
	queryNumberValidator
} from '../../../util'

export const patchDeliveryStatusValidator = [
	objectIdValidator('orderId'),
	emptyValidator('status')
		.matches(/^(out|delivered)$/, 'i')
		.withMessage('valid status options - out and delayed')
]

export const patchDeliveryDelayValidator = [
	objectIdValidator('orderId'),
	dateValidator('newDate')
]

export const getDeliveryValidator = [
	paramObjectIdValidator('apartmentId'),
	paramDateValidator('date'),
	queryNumberValidator('limit'),
	queryNumberValidator('page')
]
