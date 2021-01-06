import { body } from 'express-validator'
import { validationMessages } from './validationMessages'

export const emptyOptionalValidator = field =>
	body(field)
		.optional({ nullable: true, checkFalsy: true })
		.trim()
		.notEmpty()
		.withMessage(validationMessages.empty)
		.bail()

export const phoneOptionalValidator = field =>
	emptyOptionalValidator(field)
		.matches(/^[5-9]\d{9}$/)
		.withMessage(validationMessages.phone)

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
