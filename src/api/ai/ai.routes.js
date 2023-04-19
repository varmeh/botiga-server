import { Router } from 'express'

import { postPromptCompletion } from './ai.controller'

const router = Router()

router.post('/prompt/completion', postPromptCompletion)

export default router
