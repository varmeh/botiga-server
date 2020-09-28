import { param } from 'express-validator'
import { validationMessages } from './validationMessages'

/* Params Validators */
export const paramEmptyValidator = field =>
	param(field).trim().notEmpty().withMessage(validationMessages.empty).bail()

export const paramObjectIdValidator = field =>
	paramEmptyValidator(field)
		.bail()
		.matches(/^[0-9a-fA-F]{24}$/, 'i')
		.withMessage(validationMessages.objectId)
