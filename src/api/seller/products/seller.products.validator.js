import {
	emptyValidator,
	objectIdValidator,
	decimalValidator,
	emptyOptionalValidator,
	boolValidator,
	paramObjectIdValidator,
	urlOptionalValidator,
	decimalOptionalValidator,
	imageUrlArrayOptionalValidator
} from '../../../util'

export const postProductValidator = [
	objectIdValidator('categoryId'),
	emptyValidator('name'),
	decimalValidator('price'),
	decimalOptionalValidator('mrp'),
	decimalValidator('size.quantity'),
	emptyValidator('size.unit')
		.matches(/^(gms|kg|ml|lt|piece|pieces)$/, 'i')
		.withMessage(
			'should be either of following - gms, kg, ml, lt, piece & pieces'
		),
	emptyOptionalValidator('description'),
	urlOptionalValidator('imageUrl'),
	urlOptionalValidator('imageUrlLarge'),
	imageUrlArrayOptionalValidator('secondaryImageUrls', 4)
]

export const patchProductValidator = [
	objectIdValidator('productId'),
	objectIdValidator('categoryId'),
	emptyValidator('name'),
	decimalValidator('price'),
	decimalOptionalValidator('mrp'),
	decimalValidator('quantity'),
	emptyValidator('unit')
		.matches(/^(gms|kg|ml|lt|piece|pieces)$/, 'i')
		.withMessage(
			'should be either of following - gms, kg, ml, lt, piece & pieces'
		),
	boolValidator('available'),
	emptyOptionalValidator('description'),
	urlOptionalValidator('imageUrl'),
	urlOptionalValidator('imageUrlLarge'),
	imageUrlArrayOptionalValidator('secondaryImageUrls', 4)
]

export const postProductImageValidator = boolValidator('isMainImage')

export const deleteProductValidator = [
	paramObjectIdValidator('categoryId'),
	paramObjectIdValidator('productId')
]
