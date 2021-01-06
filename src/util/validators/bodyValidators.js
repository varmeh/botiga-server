import moment from 'moment'
import { body } from 'express-validator'
import { validationMessages } from './validationMessages'

export const emptyValidator = field =>
	body(field).trim().notEmpty().withMessage(validationMessages.empty).bail()

export const numberValidator = field =>
	emptyValidator(field)
		.isInt()
		.withMessage(validationMessages.numeric)
		.bail()
		.toInt()

export const alphaNumericValidator = field =>
	emptyValidator(field)
		.isAlphanumeric()
		.withMessage(validationMessages.alphanumeric)

export const pinValidator = field =>
	emptyValidator(field)
		.matches(/^\d{4}$/)
		.withMessage(validationMessages.length4)

export const pincodeValidator = field =>
	emptyValidator(field)
		.matches(/^\d{6}$/)
		.withMessage(validationMessages.length6)

export const otpValidator = field =>
	emptyValidator(field)
		.matches(/^\d{6}$/)
		.withMessage(validationMessages.length6)

export const phoneValidator = field =>
	emptyValidator(field)
		.matches(/^[5-9]\d{9}$/)
		.withMessage(validationMessages.phone)

export const decimalValidator = field =>
	emptyValidator(field)
		.isDecimal()
		.withMessage(validationMessages.decimal)
		.toFloat()

export const regexAlphaSpaceDigitsValidator = field =>
	emptyValidator(field)
		.matches(/^[0-9a-zA-Z\s]*$/, 'i')
		.withMessage(validationMessages.regexAlphaSpaceDigits)

export const arrayValidator = field =>
	body(field).isArray().withMessage(validationMessages.array)

export const objectIdValidator = field =>
	emptyValidator(field)
		.matches(/^[0-9a-fA-F]{24}$/, 'i')
		.withMessage(validationMessages.objectId)

export const dateValidator = field =>
	emptyValidator(field).custom(value =>
		moment(value, 'YYYY-MM-DD', true).isValid()
			? true
			: Promise.reject(validationMessages.date)
	)

export const boolValidator = field =>
	emptyValidator(field)
		.isBoolean()
		.withMessage(validationMessages.bool)
		.bail()
		.toBoolean(true)

export const urlValidator = field =>
	emptyValidator(field)
		.isURL({
			protocols: ['https'],
			// eslint-disable-next-line camelcase
			require_protocol: true
		})
		.withMessage(validationMessages.url)
