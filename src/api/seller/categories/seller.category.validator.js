import {
	alphaValidator,
	paramObjectIdValidator,
	objectIdValidator
} from '../../../util'

export const postCategoryValidator = [alphaValidator('name')]

export const deleteCategoryValidator = [paramObjectIdValidator('categoryId')]

export const patchCategoryValidator = [
	...postCategoryValidator,
	objectIdValidator('categoryId')
]
