import {
	paramObjectIdValidator,
	objectIdValidator,
	emptyValidator,
	boolValidator
} from '../../../util'

export const postCategoryValidator = [emptyValidator('name')]

export const deleteCategoryValidator = [paramObjectIdValidator('categoryId')]

export const patchCategoryValidator = [
	...postCategoryValidator,
	objectIdValidator('categoryId')
]

export const patchCategoryVisibilityValidator = [
	objectIdValidator('categoryId'),
	boolValidator('visible')
]
