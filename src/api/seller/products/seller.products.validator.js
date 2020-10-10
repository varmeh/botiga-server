import {
	emptyValidator,
	regexAlphaSpaceDigitsValidator,
	objectIdValidator,
	decimalValidator,
	numberValidator,
	paramEmptyValidator,
	emptyOptionalValidator,
	regexAlphaSpaceDigitsOptionalValidator,
	decimalOptionalValidator,
	numberOptionalValidator
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

export const getImageUrlValidator = [
	paramEmptyValidator('imageType')
		.matches(/^(jpg|jpeg|png)$/, 'i')
		.withMessage('Valid Image Format - png, jpg and jpeg')
]

export const patchProductValidator = [
	objectIdValidator('productId'),
	objectIdValidator('categoryId'),
	regexAlphaSpaceDigitsOptionalValidator('name'),
	decimalOptionalValidator('price'),
	numberOptionalValidator('size.quantity'),
	emptyOptionalValidator('size.unit')
		.matches(/^(gms|kg|ml|lt|piece|pieces)$/, 'i')
		.withMessage(
			'should be either of following - gms, kg, ml, lt, piece & pieces'
		),
	emptyOptionalValidator('available')
		.matches(/^(true|false)$/)
		.withMessage('should be a either true or false'),
	regexAlphaSpaceDigitsOptionalValidator('description'),
	emptyOptionalValidator('imageUrl')
]

export const deleteProductValidator = [
	emptyValidator('categoryId'),
	emptyValidator('productId')
]
