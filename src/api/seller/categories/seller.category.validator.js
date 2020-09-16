import { emptyValidator, alphaValidator } from '../../../util'

export const postCategoryValidator = [alphaValidator('name')]

export const deleteCategoryValidator = [emptyValidator('categoryId')]

export const patchCategoryValidator = [
	...postCategoryValidator,
	...deleteCategoryValidator
]
