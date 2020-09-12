import { Router } from 'express'
import { validationMiddleware, token } from '../../util'
import authRouter from './auth/seller.auth.routes'

import { categoryValidator } from './seller.validator'
import { postCategory, getCategory } from './seller.controller'

const router = Router()

router.use('/', authRouter)

/* Category Routes */
router.get('/category', token.authenticationMiddleware, getCategory)
router.post(
	'/category',
	token.authenticationMiddleware,
	categoryValidator,
	validationMiddleware,
	postCategory
)
router.patch('/category')
router.delete('/category')

export default router
