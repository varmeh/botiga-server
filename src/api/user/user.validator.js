import {
	paramEmptyValidator,
	paramObjectIdValidator,
	objectIdValidator,
	objectIdOptionalValidator,
	decimalValidator,
	arrayValidator
} from '../../util'

export const getSellerValidator = paramEmptyValidator('apartmentId')

export const getProductsValidator = paramObjectIdValidator('sellerId')

export const patchCartValidator = [
	objectIdOptionalValidator('sellerId'),
	decimalValidator('totalAmount'),
	arrayValidator('products'),
	objectIdValidator('products.*.productId'),
	decimalValidator('products.*.quantity')
]
