import {
	regexAlphaSpaceDigitsValidator,
	paramObjectIdValidator,
	objectIdValidator
} from '../../../util'

export const postCategoryValidator = [regexAlphaSpaceDigitsValidator('name')]

export const deleteCategoryValidator = [paramObjectIdValidator('categoryId')]

export const patchCategoryValidator = [
	...postCategoryValidator,
	objectIdValidator('categoryId')
]
