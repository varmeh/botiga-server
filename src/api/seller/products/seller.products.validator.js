import {
	emptyValidator,
	regexAlphaSpaceDigitsValidator,
	objectIdValidator,
	decimalValidator,
	numberValidator,
	emptyOptionalValidator,
	regexAlphaSpaceDigitsOptionalValidator,
	boolValidator,
	paramObjectIdValidator
} from '../../../util'

export const postProductValidator = [
	objectIdValidator('categoryId'),
	regexAlphaSpaceDigitsValidator('name'),
	decimalValidator('price'),
	numberValidator('size.quantity'),
	emptyValidator('size.unit')
		.matches(/^(gms|kg|ml|lt|piece|pieces)$/, 'i')
		.withMessage(
			'should be either of following - gms, kg, ml, lt, piece & pieces'
		),
	regexAlphaSpaceDigitsOptionalValidator('description'),
	emptyOptionalValidator('imageUrl')
]

export const patchProductValidator = [
	objectIdValidator('productId'),
	objectIdValidator('categoryId'),
	regexAlphaSpaceDigitsValidator('name'),
	decimalValidator('price'),
	numberValidator('quantity'),
	emptyValidator('unit')
		.matches(/^(gms|kg|ml|lt|piece|pieces)$/, 'i')
		.withMessage(
			'should be either of following - gms, kg, ml, lt, piece & pieces'
		),
	boolValidator('available'),
	regexAlphaSpaceDigitsOptionalValidator('description'),
	emptyOptionalValidator('imageUrl'),
	boolValidator('updateImage')
]

export const deleteProductValidator = [
	paramObjectIdValidator('categoryId'),
	paramObjectIdValidator('productId')
]
