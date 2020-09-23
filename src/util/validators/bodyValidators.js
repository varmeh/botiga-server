import { body } from 'express-validator'
import { validationMessages } from './validationMessages'

export const emptyValidator = field =>
	body(field).trim().notEmpty().withMessage(validationMessages.empty).bail()

export const alphaValidator = field =>
	emptyValidator(field).isAlpha().withMessage(validationMessages.alphaOnly)

export const alphaNumericValidator = field =>
	emptyValidator(field)
		.isAlphanumeric()
		.withMessage(validationMessages.alphaOnly)

export const numberValidator = field =>
	emptyValidator(field).isInt().withMessage(validationMessages.numeric)

export const pinValidator = field =>
	emptyValidator(field)
		.bail()
		.matches(/^\d{6}$/)
		.withMessage(validationMessages.pinLength)

export const otpValidator = field =>
	emptyValidator(field)
		.bail()
		.matches(/^\d{6}$/)
		.withMessage(validationMessages.pinLength)

export const phoneValidator = field =>
	emptyValidator(field)
		.bail()
		.matches(/^9\d{9}$/)
		.withMessage('should be a valid phone number')

export const decimalValidator = field =>
	emptyValidator(field).isDecimal().withMessage(validationMessages.decimal)

export const addressValidator = field =>
	emptyValidator(field)
		.matches(/^[a-zA-Z0-9\s,.-]*$/, 'i')
		.withMessage(validationMessages.addressRegex)

export const alphaSpaceValidator = field =>
	emptyValidator(field)
		.matches(/^[a-zA-Z\s]*$/, 'i')
		.withMessage(validationMessages.alphaSpace)
