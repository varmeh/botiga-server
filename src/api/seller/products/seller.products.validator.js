import {
	emptyValidator,
	objectIdValidator,
	decimalValidator,
	emptyOptionalValidator,
	boolValidator,
	paramObjectIdValidator,
	decimalOptionalValidator,
	imageUrlArrayValidator,
	fieldExists
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
	fieldExists('imageUrl'),
	fieldExists('imageUrlLarge'),
	imageUrlArrayValidator('secondaryImageUrls', 4)
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
	fieldExists('imageUrl'),
	fieldExists('imageUrlLarge'),
	imageUrlArrayValidator('secondaryImageUrls', 4)
]

export const patchProductRecommendedStatusValidator = [
	objectIdValidator('productId'),
	objectIdValidator('categoryId'),
	boolValidator('recommended')
]

export const postProductImageValidator = boolValidator('isMainImage')

export const deleteProductValidator = [
	paramObjectIdValidator('categoryId'),
	paramObjectIdValidator('productId')
]
