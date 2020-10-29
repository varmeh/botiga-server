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

export const addressValidator = field =>
	emptyValidator(field)
		.matches(/^[a-zA-Z0-9\s,.-]*$/, 'i')
		.withMessage(validationMessages.addressRegex)

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
