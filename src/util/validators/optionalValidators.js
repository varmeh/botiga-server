import { body } from 'express-validator'
import { validationMessages } from './validationMessages'

export const emptyOptionalValidator = field =>
	body(field)
		.optional({ nullable: true, checkFalsy: true })
		.trim()
		.notEmpty()
		.withMessage(validationMessages.empty)
		.bail()

export const regexAlphaSpaceDigitsOptionalValidator = field =>
	emptyOptionalValidator(field)
		.matches(/^[0-9a-zA-Z\s]*$/, 'i')
		.withMessage(validationMessages.regexAlphaSpaceDigits)

export const decimalOptionalValidator = field =>
	emptyOptionalValidator(field)
		.isDecimal()
		.withMessage(validationMessages.decimal)

export const numberOptionalValidator = field =>
	emptyOptionalValidator(field)
		.isInt()
		.withMessage(validationMessages.numeric)
		.toInt()

export const phoneOptionalValidator = field =>
	emptyOptionalValidator(field)
		.matches(/^[5-9]\d{9}$/)
		.withMessage(validationMessages.phone)

export const addressOptionalValidator = field =>
	emptyOptionalValidator(field)
		.matches(/^[a-zA-Z0-9\s,.-]*$/, 'i')
		.withMessage(validationMessages.addressRegex)

export const pincodeOptionalValidator = field =>
	emptyOptionalValidator(field)
		.matches(/^\d{6}$/)
		.withMessage(validationMessages.length6)

export const emailOptionalValidator = field =>
	emptyOptionalValidator(field).isEmail().withMessage(validationMessages.email)

export const objectIdOptionalValidator = field =>
	emptyOptionalValidator(field)
		.matches(/^[0-9a-fA-F]{24}$/, 'i')
		.withMessage(validationMessages.objectId)

export const urlOptionalValidator = field =>
	emptyOptionalValidator(field)
		.isURL({
			protocols: ['https'],
			// eslint-disable-next-line camelcase
			require_protocol: true
		})
		.withMessage(validationMessages.url)

export const boolOptionalValidator = field =>
	emptyOptionalValidator(field)
		.isBoolean()
		.withMessage(validationMessages.bool)
		.bail()
		.toBoolean(true)
