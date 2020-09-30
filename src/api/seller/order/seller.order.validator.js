import {
	emptyValidator,
	objectIdValidator,
	paramObjectIdValidator,
	paramDateValidator,
	dateValidator
} from '../../../util'

export const postCancelOrderValidator = [objectIdValidator('orderId')]

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
	paramDateValidator('date')
]

export const getOrdersAggregateValidator = [paramDateValidator('date')]

export const getOrdersValidator = [...getDeliveryValidator]
