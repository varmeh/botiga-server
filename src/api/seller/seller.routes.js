import { Router } from 'express'

import authRouter from './auth/seller.auth.routes'
import categoriesRouter from './categories/seller.category.routes'
import productsRouter from './products/seller.products.routes'
import apartmentsRouter from './apartments/seller.apartments.routes'
import profileRouter from './profile/seller.profile.routes'

const router = Router()

router.use('/auth', authRouter)
router.use('/categories', categoriesRouter)
router.use('/products', productsRouter)
router.use('/apartments', apartmentsRouter)
router.use('/profile', profileRouter)

export default router
