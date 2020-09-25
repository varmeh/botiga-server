import {
	emptyValidator,
	phoneValidator,
	emailValidator,
	alphaNumericValidator,
	decimalValidator,
	numberValidator,
	paramEmptyValidator,
	arrayValidator
} from '../../util'

export const getSellerValidator = paramEmptyValidator('apartmentId')

export const getProductsValidator = paramEmptyValidator('sellerId')

export const postOrderValidator = [
	alphaNumericValidator('sellerId'),
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
