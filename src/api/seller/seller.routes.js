import { Router } from 'express'
import { validationMiddleware, token } from '../../util'
import authRouter from './auth/seller.auth.routes'

import {
	postCategoryValidator,
	deleteCategoryValidator,
	patchCategoryValidator
} from './seller.validator'
import {
	postCategory,
	getCategory,
	deleteCategory,
	patchCategory
} from './seller.controller'

const router = Router()

router.use('/', authRouter)

/* Category Routes */
router.get('/category', token.authenticationMiddleware, getCategory)
router.post(
	'/category',
	token.authenticationMiddleware,
	postCategoryValidator,
	validationMiddleware,
	postCategory
)
router.patch(
	'/category',
	token.authenticationMiddleware,
	patchCategoryValidator,
	validationMiddleware,
	patchCategory
)
router.delete(
	'/category',
	token.authenticationMiddleware,
	deleteCategoryValidator,
	validationMiddleware,
	deleteCategory
)

export default router
