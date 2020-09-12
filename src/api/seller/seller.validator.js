import { emptyValidator } from '../../util'

export const postCategoryValidator = [
	emptyValidator('name').isAlpha().withMessage('should be alphabets only')
]

export const deleteCategoryValidator = [emptyValidator('categoryId')]
