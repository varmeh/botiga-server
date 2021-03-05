import {
	emptyValidator,
	decimalValidator,
	numberValidator,
	arrayValidator,
	objectIdValidator,
	queryNumberValidator,
	decimalOptionalValidator,
	emptyOptionalValidator
} from '../../../util'

export const postOrderValidator = [
	objectIdValidator('sellerId'),
	objectIdValidator('addressId'),
	decimalValidator('totalAmount'),
	decimalOptionalValidator('discountAmount'),
	emptyOptionalValidator('couponCode'),
	arrayValidator('products'),
	emptyValidator('products.*.name'),
	decimalValidator('products.*.price'),
	emptyValidator('products.*.unitInfo'),
	numberValidator('products.*.quantity')
]

export const postProductsValidator = [
	objectIdValidator('sellerId'),
	arrayValidator('products'),
	objectIdValidator('products.*.productId'),
	numberValidator('products.*.quantity')
]

export const postCancelOrderValidator = [objectIdValidator('orderId')]

export const getOrdersValidator = [
	queryNumberValidator('limit'),
	queryNumberValidator('page')
]

export const postTransactionValidator = [objectIdValidator('orderId')]
