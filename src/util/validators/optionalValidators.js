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

export const phoneOptionalValidator = field =>
	emptyOptionalValidator(field)
		.bail()
		.matches(/^9\d{9}$/)
		.withMessage('should be a valid phone number')

export const addressOptionalValidator = field =>
	emptyOptionalValidator(field)
		.matches(/^[a-zA-Z0-9\s,.-]*$/, 'i')
		.withMessage(validationMessages.addressRegex)

export const pinOptionalValidator = field =>
	emptyOptionalValidator(field)
		.bail()
		.matches(/^\d{6}$/)
		.withMessage(validationMessages.pinLength)

export const alphaNumericOptionalValidator = field =>
	emptyOptionalValidator(field)
		.isAlphanumeric()
		.withMessage(validationMessages.alphaOnly)
