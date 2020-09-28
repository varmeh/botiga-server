import { emptyValidator, objectIdValidator } from '../../../util'

export const postCancelOrderValidator = [objectIdValidator('orderId')]

export const patchDeliveryStatusValidator = [
	objectIdValidator('orderId'),
	emptyValidator('status')
		.matches(/^(out|delivered)$/, 'i')
		.withMessage('valid status options - out and delayed')
]

export const patchDeliveryDelayValidator = [
	objectIdValidator('orderId'),
	emptyValidator('newDate')
		.toDate()
		.isDate()
		.withMessage('should be a valid date')
]
