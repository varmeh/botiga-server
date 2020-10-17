import { query } from 'express-validator'
import { validationMessages } from './validationMessages'

/* Params Validators */
export const queryEmptyValidator = field =>
	query(field)
		.optional()
		.trim()
		.notEmpty()
		.withMessage(validationMessages.empty)
		.bail()

export const queryNumberValidator = field =>
	queryEmptyValidator(field)
		.isInt()
		.withMessage(validationMessages.numeric)
		.bail()
		.toInt()
		.custom(val => val > 0)
		.withMessage('should be greator than 0')
