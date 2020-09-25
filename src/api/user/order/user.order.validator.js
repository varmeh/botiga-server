import {
	emptyValidator,
	phoneValidator,
	emailValidator,
	alphaNumericValidator,
	decimalValidator,
	numberValidator,
	arrayValidator
} from '../../../util'

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
