import {
	paramEmptyValidator,
	paramObjectIdValidator,
	objectIdValidator,
	decimalValidator,
	arrayValidator
} from '../../util'

export const getSellerValidator = paramEmptyValidator('apartmentId')

export const getProductsValidator = paramObjectIdValidator('sellerId')

export const patchCartValidator = [
	objectIdValidator('sellerId'),
	objectIdValidator('addressId'),
	arrayValidator('products'),
	objectIdValidator('products.*.productId'),
	decimalValidator('products.*.quantity')
]
