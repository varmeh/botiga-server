// import CreateHttpError from 'http-errors'
import { controllerErroHandler } from '../../util'
import { generateLearnerPersonaPrompt } from './ai.utils'

export const postPromptCompletion = (req, res, next) => {
	try {
		const { learnerType, learnerPersona, queryContext, personaWeightage } =
			req.body
		const prompt = generateLearnerPersonaPrompt({
			learnerType,
			learnerPersona,
			queryContext,
			personaWeightage
		})

		res.status(200).json({ prompt })
	} catch (error) {
		controllerErroHandler(error, next)
	}
}
