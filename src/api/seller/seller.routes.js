import { Router } from 'express'
import { validationMiddleware } from '../../util'
import authRouter from './auth/seller.auth.routes'

import { categoryValidator } from './seller.validator'
import { postCategory } from './seller.controller'

const router = Router()

router.use('/', authRouter)

/* Category Routes */
router.get('/category')
router.post('/category', categoryValidator, validationMiddleware, postCategory)
router.patch('/category')
router.delete('/category')

export default router
