import { emptyValidator, objectIdValidator } from '../../../util'

export const postCancelOrderValidator = [objectIdValidator('orderId')]

export const patchOrderStatusValidator = [
	objectIdValidator('orderId'),
	emptyValidator('status')
		.matches(/^(out|delayed|delivered)$/, 'i')
		.withMessage('valid status options - out, delayed and delivered')
]
