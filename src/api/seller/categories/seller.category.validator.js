import {
	paramObjectIdValidator,
	objectIdValidator,
	emptyValidator
} from '../../../util'

export const postCategoryValidator = [emptyValidator('name')]

export const deleteCategoryValidator = [paramObjectIdValidator('categoryId')]

export const patchCategoryValidator = [
	...postCategoryValidator,
	objectIdValidator('categoryId')
]
