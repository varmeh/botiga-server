import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'

import {
	postCategoryValidator,
	deleteCategoryValidator,
	patchCategoryValidator,
	patchCategoryVisibilityValidator
} from './seller.category.validator'

import {
	postCategory,
	getCategories,
	deleteCategory,
	patchCategory,
	patchCategoryVisibility
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

router.patch(
	'/visible',
	token.authenticationMiddleware,
	patchCategoryVisibilityValidator,
	validationMiddleware,
	patchCategoryVisibility
)

export default router
