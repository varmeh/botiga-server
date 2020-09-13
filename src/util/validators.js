import { body } from 'express-validator'

const validationMessages = {
	empty: 'should not be empty',
	addressRegex:
		'should have following characters - alphabets, numbers, comma, spaces, dot and hypen',
	numeric: 'should have numbers only',
	alphaSpace: 'should have alphabets & space only',
	alphaOnly: 'should have alphabets only',
	alphaNumeric: 'should have alphabets & numbers only',
	decimal: 'should be a decimal',
	pinLength: 'should have a length of 6 characters',
	phoneLength: 'should have a length of 10 characters'
}

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
	numberValidator(field)
		.bail()
		.isLength({ min: 6, max: 6 })
		.withMessage(validationMessages.pinLength)

export const phoneValidator = field =>
	emptyValidator(field)
		.isInt()
		.withMessage(validationMessages.numeric)
		.bail()
		.isInt()
		.withMessage(validationMessages.numeric)
		.isLength({ min: 10, max: 10 })
		.withMessage(validationMessages.phoneLength)

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
