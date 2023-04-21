import { Router } from 'express'

import {
	postPromptCompletion,
	getPersonaClassificationQuestions,
	postPersonaClassificationResult
} from './ai.controller'

const router = Router()

router.post('/prompt/completion', postPromptCompletion)

// Persona Test
router.get('/learner/persona/questions', getPersonaClassificationQuestions)
router.post('/learner/persona/result', postPersonaClassificationResult)

export default router
