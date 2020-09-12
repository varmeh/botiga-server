import { Router } from 'express'
import authRouter from './auth/seller.auth.routes'

const router = Router()

router.use('/', authRouter)

export default router
