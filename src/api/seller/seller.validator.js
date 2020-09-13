import {
	emptyValidator,
	alphaValidator,
	alphaNumericValidator,
	decimalValidator,
	numberValidator
} from '../../util'

export const postCategoryValidator = [alphaValidator('name')]

export const deleteCategoryValidator = [emptyValidator('categoryId')]

export const patchCategoryValidator = [
	...postCategoryValidator,
	...deleteCategoryValidator
]

export const postProductValidator = [
	alphaNumericValidator('categoryId'),
	alphaNumericValidator('name'),
	decimalValidator('price'),
	numberValidator('size.quantity'),
	emptyValidator('size.unit')
		.matches(/^(gms|kg|ml|lt|piece|pieces)$/, 'i')
		.withMessage(
			'should be either of following - gms, kg, ml, lt, piece & pieces'
		)
]
