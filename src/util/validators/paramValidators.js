import moment from 'moment'
import { param } from 'express-validator'
import { validationMessages } from './validationMessages'

/* Params Validators */
export const paramEmptyValidator = field =>
	param(field).trim().notEmpty().withMessage(validationMessages.empty).bail()

export const paramObjectIdValidator = field =>
	paramEmptyValidator(field)
		.matches(/^[0-9a-fA-F]{24}$/, 'i')
		.withMessage(validationMessages.objectId)

export const paramDateValidator = field =>
	paramEmptyValidator(field).custom(value =>
		moment(value, 'YYYY-MM-DD', true).isValid()
			? true
			: Promise.reject(validationMessages.date)
	)

export const paramPhoneValidator = field =>
	paramEmptyValidator(field)
		.matches(/^[5-9]\d{9}$/)
		.withMessage(validationMessages.phone)

export const paramNumberValidator = field =>
	paramEmptyValidator(field).isInt().withMessage(validationMessages.numeric)
