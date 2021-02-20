import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'

import {
	postProductValidator,
	patchProductValidator,
	deleteProductValidator,
	postProductImageValidator
} from './seller.products.validator'

import {
	postProduct,
	getProducts,
	deleteProduct,
	patchProduct,
	postProductImage
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

router.post(
	'/images',
	token.authenticationMiddleware,
	postProductImageValidator,
	validationMiddleware,
	postProductImage
)

export default router
