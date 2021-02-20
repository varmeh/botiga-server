import { body } from 'express-validator'

import {
	emptyValidator,
	objectIdValidator,
	decimalValidator,
	emptyOptionalValidator,
	boolValidator,
	paramObjectIdValidator,
	urlOptionalValidator,
	decimalOptionalValidator
} from '../../../util'

const secondaryImageUrlsValidator = body('secondaryImageUrls')
	.optional({ nullable: true, checkFalsy: true })
	.custom(arr => Array.isArray(arr))
	.withMessage('should be an array')
	.bail()
	.custom(arr => arr.length <= 4)
	.withMessage('should have less than 4 secondary images')
	.bail()
	.custom(arr => {
		let isValidArrayOfUrls = true
		arr.forEach(val => {
			if (!val.startsWith('https://')) {
				isValidArrayOfUrls = false
			}
		})
		return isValidArrayOfUrls
	})
	.withMessage('should have valid urls')

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
	emptyOptionalValidator('tag')
		.matches(/^(BestSeller|Recommended|New)$/, 'i')
		.withMessage(
			'should be either of following - BestSeller, New or Recommended'
		),
	emptyOptionalValidator('description'),
	urlOptionalValidator('imageUrl'),
	urlOptionalValidator('imageUrlLarge'),
	secondaryImageUrlsValidator
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
	emptyOptionalValidator('tag')
		.matches(/^(BestSeller|Recommended|New)$/, 'i')
		.withMessage(
			'should be either of following - BestSeller, New or Recommended'
		),
	urlOptionalValidator('imageUrl'),
	boolValidator('updateImage'),
	urlOptionalValidator('imageUrlLarge'),
	secondaryImageUrlsValidator
]

export const postProductImageValidator = boolValidator('isMainImage')

export const deleteProductValidator = [
	paramObjectIdValidator('categoryId'),
	paramObjectIdValidator('productId')
]
