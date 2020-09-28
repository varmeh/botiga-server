import {
	emptyValidator,
	phoneValidator,
	emailValidator,
	decimalValidator,
	numberValidator,
	arrayValidator,
	objectIdValidator
} from '../../../util'

export const postOrderValidator = [
	objectIdValidator('sellerId'),
	emptyValidator('brandName'),
	phoneValidator('apartmentContact.phone'),
	phoneValidator('apartmentContact.whatsapp'),
	emailValidator('apartmentContact.email'),
	decimalValidator('totalAmount'),
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
