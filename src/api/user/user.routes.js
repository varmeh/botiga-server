import { Router } from 'express'

import authRouter from './auth/user.auth.routes'

const router = Router()

router.use('/auth', authRouter)

export default router
