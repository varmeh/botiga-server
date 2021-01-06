import {
	emptyValidator,
	objectIdValidator,
	decimalValidator,
	numberValidator,
	emptyOptionalValidator,
	boolValidator,
	paramObjectIdValidator,
	urlOptionalValidator
} from '../../../util'

export const postProductValidator = [
	objectIdValidator('categoryId'),
	emptyValidator('name'),
	decimalValidator('price'),
	numberValidator('size.quantity'),
	emptyValidator('size.unit')
		.matches(/^(gms|kg|ml|lt|piece|pieces)$/, 'i')
		.withMessage(
			'should be either of following - gms, kg, ml, lt, piece & pieces'
		),
	emptyOptionalValidator('description'),
	urlOptionalValidator('imageUrl')
]

export const patchProductValidator = [
	objectIdValidator('productId'),
	objectIdValidator('categoryId'),
	emptyValidator('name'),
	decimalValidator('price'),
	numberValidator('quantity'),
	emptyValidator('unit')
		.matches(/^(gms|kg|ml|lt|piece|pieces)$/, 'i')
		.withMessage(
			'should be either of following - gms, kg, ml, lt, piece & pieces'
		),
	boolValidator('available'),
	emptyOptionalValidator('description'),
	urlOptionalValidator('imageUrl'),
	boolValidator('updateImage')
]

export const deleteProductValidator = [
	paramObjectIdValidator('categoryId'),
	paramObjectIdValidator('productId')
]
