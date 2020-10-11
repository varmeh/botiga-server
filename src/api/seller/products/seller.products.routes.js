import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'

import {
	postProductValidator,
	patchProductValidator,
	deleteProductValidator
} from './seller.products.validator'

import {
	postProduct,
	getProducts,
	deleteProduct,
	patchProduct
} from './seller.products.controller'

const router = Router()

/* Products Routes */
router.get('/', token.authenticationMiddleware, getProducts)
router.post(
	'/',
	token.authenticationMiddleware,
	postProductValidator,
	validationMiddleware,
	postProduct
)
router.patch(
	'/',
	token.authenticationMiddleware,
	patchProductValidator,
	validationMiddleware,
	patchProduct
)
router.delete(
	'/:productId/categories/:categoryId',
	token.authenticationMiddleware,
	deleteProductValidator,
	validationMiddleware,
	deleteProduct
)

export default router
