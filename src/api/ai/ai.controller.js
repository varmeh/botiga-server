// import CreateHttpError from 'http-errors'
import { controllerErroHandler } from '../../util'
import { generateLearnerPersonaPrompt } from './ai.utils'
import questionarieJson from './learnerPersonaQuestionarie.json'

export const postPromptCompletion = (req, res, next) => {
	try {
		const prompt = generateLearnerPersonaPrompt(req.body)

		res.status(200).json({ prompt })
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getPersonaClassificationQuestions = (_req, res, next) => {
	try {
		res.status(200).json({ questions: questionarieJson })
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postPersonaClassificationResult = (req, res, next) => {
	try {
		const { answers } = req.body
		const scores = {}

		if (answers.length !== questionarieJson.length) {
			res.status(400).json({ error: 'Invalid number of answers' })
			return
		}

		answers.forEach((answer, index) => {
			const selectedOption = questionarieJson[index].options.find(
				option => option.label === answer
			)

			if (selectedOption) {
				if (!scores[selectedOption.persona]) {
					scores[selectedOption.persona] = 0
				}
				scores[selectedOption.persona] += 1
			}
		})

		const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1])
		const topScores = sortedScores.slice(0, 2)

		res.json(topScores)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}
