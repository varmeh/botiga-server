import {
	emptyValidator,
	alphaSpaceValidator,
	alphaNumericValidator,
	decimalValidator,
	numberValidator,
	paramEmptyValidator,
	emptyOptionalValidator,
	alphaSpaceOptionalValidator,
	decimalOptionalValidator,
	numberOptionalValidator
} from '../../../util'

export const postProductValidator = [
	alphaNumericValidator('categoryId'),
	alphaSpaceValidator('name'),
	decimalValidator('price'),
	numberValidator('size.quantity'),
	emptyValidator('size.unit')
		.matches(/^(gms|kg|ml|lt|piece|pieces)$/, 'i')
		.withMessage(
			'should be either of following - gms, kg, ml, lt, piece & pieces'
		),
	alphaSpaceOptionalValidator('description'),
	emptyOptionalValidator('imageUrl')
]

export const getImageUrlValidator = [
	paramEmptyValidator('imageType')
		.matches(/^(jpg|jpeg|png)$/, 'i')
		.withMessage('Valid Image Format - png, jpg and jpeg')
]

export const patchProductValidator = [
	alphaNumericValidator('productId'),
	alphaNumericValidator('categoryId'),
	alphaSpaceOptionalValidator('name'),
	decimalOptionalValidator('price'),
	numberOptionalValidator('size.quantity'),
	emptyOptionalValidator('size.unit')
		.matches(/^(gms|kg|ml|lt|piece|pieces)$/, 'i')
		.withMessage(
			'should be either of following - gms, kg, ml, lt, piece & pieces'
		),
	alphaSpaceOptionalValidator('description'),
	emptyOptionalValidator('imageUrl')
]

export const deleteProductValidator = [
	emptyValidator('categoryId'),
	emptyValidator('productId')
]
