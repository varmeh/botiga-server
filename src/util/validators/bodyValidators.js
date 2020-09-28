import { body } from 'express-validator'
import { validationMessages } from './validationMessages'

export const emptyValidator = field =>
	body(field).trim().notEmpty().withMessage(validationMessages.empty).bail()

export const alphaValidator = field =>
	emptyValidator(field).isAlpha().withMessage(validationMessages.alphaOnly)

export const numberValidator = field =>
	emptyValidator(field)
		.isInt()
		.withMessage(validationMessages.numeric)
		.bail()
		.toInt()

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
	emptyValidator(field)
		.isDecimal()
		.withMessage(validationMessages.decimal)
		.toFloat()

export const addressValidator = field =>
	emptyValidator(field)
		.matches(/^[a-zA-Z0-9\s,.-]*$/, 'i')
		.withMessage(validationMessages.addressRegex)

export const alphaSpaceValidator = field =>
	emptyValidator(field)
		.matches(/^[a-zA-Z\s]*$/, 'i')
		.withMessage(validationMessages.alphaSpace)

export const emailValidator = field =>
	emptyValidator(field)
		.isEmail()
		.withMessage(validationMessages.email)
		.normalizeEmail()

export const arrayValidator = field =>
	body(field)
		.notEmpty()
		.withMessage(validationMessages.empty)
		.bail()
		.isArray()
		.withMessage(validationMessages.array)

export const objectIdValidator = field =>
	emptyValidator(field)
		.bail()
		.matches(/^[0-9a-fA-F]{24}$/, 'i')
		.withMessage(validationMessages.objectId)
