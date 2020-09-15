import { Router } from 'express'
import { validationMiddleware, token } from '../../util'
import authRouter from './auth/seller.auth.routes'

import {
	postCategoryValidator,
	deleteCategoryValidator,
	patchCategoryValidator,
	postProductValidator,
	getImageUrlValidator,
	patchProductValidator,
	deleteProductValidator
} from './seller.validator'
import {
	postCategory,
	getCategories,
	deleteCategory,
	patchCategory,
	postProduct,
	getProducts,
	deleteProduct,
	patchProduct,
	getImageUrl
} from './seller.controller'

const router = Router()

router.use('/auth', authRouter)

/* Category Routes */
router.get('/categories', token.authenticationMiddleware, getCategories)
router.post(
	'/categories',
	token.authenticationMiddleware,
	postCategoryValidator,
	validationMiddleware,
	postCategory
)
router.patch(
	'/categories',
	token.authenticationMiddleware,
	patchCategoryValidator,
	validationMiddleware,
	patchCategory
)
router.delete(
	'/categories',
	token.authenticationMiddleware,
	deleteCategoryValidator,
	validationMiddleware,
	deleteCategory
)

/* Products Routes */
router.get('/products', token.authenticationMiddleware, getProducts)
router.post(
	'/products',
	token.authenticationMiddleware,
	postProductValidator,
	validationMiddleware,
	postProduct
)
router.patch(
	'/products',
	token.authenticationMiddleware,
	patchProductValidator,
	validationMiddleware,
	patchProduct
)
router.delete(
	'/products',
	token.authenticationMiddleware,
	deleteProductValidator,
	validationMiddleware,
	deleteProduct
)

router.get(
	'/imageurls/:imageType',
	token.authenticationMiddleware,
	getImageUrlValidator,
	validationMiddleware,
	getImageUrl
)

export default router
