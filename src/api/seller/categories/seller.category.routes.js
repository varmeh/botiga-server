import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'

import {
	postCategoryValidator,
	deleteCategoryValidator,
	patchCategoryValidator
} from './seller.category.validator'

import {
	postCategory,
	getCategories,
	deleteCategory,
	patchCategory
} from './seller.category.controller'

const router = Router()

/* Category Routes */
router.get('/', token.authenticationMiddleware, getCategories)
router.post(
	'/',
	token.authenticationMiddleware,
	postCategoryValidator,
	validationMiddleware,
	postCategory
)
router.patch(
	'/',
	token.authenticationMiddleware,
	patchCategoryValidator,
	validationMiddleware,
	patchCategory
)
router.delete(
	'/:categoryId',
	token.authenticationMiddleware,
	deleteCategoryValidator,
	validationMiddleware,
	deleteCategory
)

export default router
