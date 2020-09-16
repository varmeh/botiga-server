import { body } from 'express-validator'
import { validationMessages } from './validationMessages'

export const emptyOptionalValidator = field =>
	body(field)
		.optional()
		.trim()
		.notEmpty()
		.withMessage(validationMessages.empty)
		.bail()

export const alphaSpaceOptionalValidator = field =>
	emptyOptionalValidator(field)
		.matches(/^[a-zA-Z\s]*$/, 'i')
		.withMessage(validationMessages.alphaSpace)

export const decimalOptionalValidator = field =>
	emptyOptionalValidator(field)
		.isDecimal()
		.withMessage(validationMessages.decimal)

export const numberOptionalValidator = field =>
	emptyOptionalValidator(field).isInt().withMessage(validationMessages.numeric)
