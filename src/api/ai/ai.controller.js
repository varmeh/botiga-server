// import CreateHttpError from 'http-errors'
import { controllerErroHandler } from '../../util'
import { generateLearnerPersonaPrompt } from './ai.utils'

export const postPromptCompletion = (req, res, next) => {
	try {
		const prompt = generateLearnerPersonaPrompt(req.body)

		res.status(200).json({ prompt })
	} catch (error) {
		controllerErroHandler(error, next)
	}
}
