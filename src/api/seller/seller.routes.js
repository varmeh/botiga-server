import { Router } from 'express'

import authRouter from './auth/seller.auth.routes'
import categoriesRouter from './categories/seller.category.routes'
import productsRouter from './products/seller.products.routes'
import apartmentsRouter from './apartments/seller.apartments.routes'
import profileRouter from './profile/seller.profile.routes'
import ordersRouter from './order/seller.order.routes'
import deliveryRouter from './delivery/seller.delivery.routes'

const router = Router()

router.use('/auth', authRouter)
router.use('/categories', categoriesRouter)
router.use('/products', productsRouter)
router.use('/apartments', apartmentsRouter)
router.use('/profile', profileRouter)
router.use('/orders', ordersRouter)
router.use('/delivery', deliveryRouter)

export default router
