import { body } from 'express-validator'

const validationMessages = {
	empty: 'should not be empty',
	numeric: 'should have numbers only',
	pinLength: 'should have a length of 6 characters',
	phoneLength: 'should have a length of 10 characters'
}

export const isEmptyValidator = field =>
	body(field).trim().notEmpty().withMessage(validationMessages.empty).bail()

export const pinValidator = field =>
	isEmptyValidator(field)
		.isInt()
		.withMessage(validationMessages.numeric)
		.bail()
		.isLength({ min: 6, max: 6 })
		.withMessage(validationMessages.pinLength)

export const phoneValidator = field =>
	isEmptyValidator(field)
		.isInt()
		.withMessage(validationMessages.numeric)
		.bail()
		.isInt()
		.withMessage(validationMessages.numeric)
		.isLength({ min: 10, max: 10 })
		.withMessage(validationMessages.phoneLength)
