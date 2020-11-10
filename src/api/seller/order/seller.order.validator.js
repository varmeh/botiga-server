import {
	objectIdValidator,
	paramObjectIdValidator,
	paramDateValidator,
	queryNumberValidator
} from '../../../util'

export const postCancelOrderValidator = [objectIdValidator('orderId')]

export const getOrdersAggregateValidator = [paramDateValidator('date')]

export const getOrdersValidator = [
	paramObjectIdValidator('apartmentId'),
	paramDateValidator('date'),
	queryNumberValidator('limit'),
	queryNumberValidator('page')
]
