import {
	emptyValidator,
	phoneValidator,
	emptyOptionalValidator,
	decimalValidator,
	numberValidator,
	arrayValidator,
	objectIdValidator,
	dateValidator,
	queryNumberValidator
} from '../../../util'

export const postOrderValidator = [
	objectIdValidator('sellerId'),
	phoneValidator('apartmentContact.phone'),
	phoneValidator('apartmentContact.whatsapp'),
	emptyOptionalValidator('apartmentContact.email'),
	decimalValidator('totalAmount'),
	dateValidator('deliveryDate'),
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
	objectIdValidator('products.*.categoryId'),
	numberValidator('products.*.quantity')
]

export const postCancelOrderValidator = [objectIdValidator('orderId')]

export const getOrdersValidator = [
	queryNumberValidator('limit'),
	queryNumberValidator('page')
]
