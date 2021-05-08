import {
	objectIdValidator,
	paramObjectIdValidator,
	paramDateValidator,
	queryNumberValidator,
	paramPhoneValidator,
	paramNumberValidator
} from '../../../util'

export const postCancelOrderValidator = [objectIdValidator('orderId')]

export const patchRefundCompletedValidator = [objectIdValidator('orderId')]

export const getOrdersAggregateValidator = [paramDateValidator('date')]

export const getOrdersValidator = [
	paramObjectIdValidator('apartmentId'),
	paramDateValidator('date'),
	queryNumberValidator('limit'),
	queryNumberValidator('page')
]

export const getOrdersByPhoneValidator = [paramPhoneValidator('number')]

export const getOrdersByOrderNumberValidator = [paramNumberValidator('number')]
