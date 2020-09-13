import { Router } from 'express'
import { validationMiddleware, token } from '../../util'
import authRouter from './auth/seller.auth.routes'

import {
	postCategoryValidator,
	deleteCategoryValidator,
	patchCategoryValidator,
	postProductValidator
} from './seller.validator'
import {
	postCategory,
	getCategory,
	deleteCategory,
	patchCategory,
	postProduct,
	getProducts,
	deleteProduct,
	patchProduct
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

/* Products Routes */
router.get('/products', token.authenticationMiddleware, getProducts)
router.post(
	'/product',
	token.authenticationMiddleware,
	postProductValidator,
	validationMiddleware,
	postProduct
)
router.patch(
	'/product',
	token.authenticationMiddleware,
	// patchProductValidator,
	validationMiddleware,
	patchProduct
)
router.delete(
	'/product',
	token.authenticationMiddleware,
	// deleteProductValidator,
	validationMiddleware,
	deleteProduct
)

export default router
