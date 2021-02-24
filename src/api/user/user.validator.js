import {
	paramEmptyValidator,
	paramObjectIdValidator,
	objectIdValidator,
	objectIdOptionalValidator,
	decimalValidator,
	arrayValidator
} from '../../util'

export const paramApartmentIdValidator = paramEmptyValidator('apartmentId')

export const paramSellerIdValidator = paramObjectIdValidator('sellerId')

export const getCartValidator = paramObjectIdValidator('addressId')

export const patchCartValidator = [
	objectIdOptionalValidator('sellerId'),
	objectIdValidator('addressId'),
	arrayValidator('products'),
	objectIdValidator('products.*.productId'),
	decimalValidator('products.*.quantity')
]
