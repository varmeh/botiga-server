import { param } from 'express-validator'
import { validationMessages } from './validationMessages'

/* Params Validators */
export const paramEmptyValidator = field =>
	param(field).trim().notEmpty().withMessage(validationMessages.empty).bail()
