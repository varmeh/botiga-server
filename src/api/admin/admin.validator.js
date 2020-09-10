import { body } from 'express-validator'

export const validationErrorMessages = {
	addressRegex:
		'should have following characters - alphabets, numbers, comma, spaces, dot and hypen',
	empty: 'should not be empty',
	numeric: 'should have numbers only',
	decimal: 'should be decimal',
	territory: 'should have alphabets & space only',
	pinLength: 'should have a length of 6 characters'
}

const validateCoordinates = field =>
	body(field)
		.trim()
		.notEmpty()
		.withMessage(validationErrorMessages.empty)
		.bail()
		.isDecimal()
		.withMessage(validationErrorMessages.decimal)

const validateTeritory = field =>
	body(field)
		.trim()
		.notEmpty()
		.withMessage(validationErrorMessages.empty)
		.bail()
		.matches(/^[a-zA-Z\s]*$/, 'i')
		.withMessage(validationErrorMessages.territory)

export const apartmentValidator = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage(validationErrorMessages.empty)
		.bail()
		.matches(/^[a-zA-Z0-9\s,.-]*$/, 'i')
		.withMessage(validationErrorMessages.addressRegex),
	validateTeritory('city'),
	validateTeritory('area'),
	validateTeritory('state'),
	body('pincode')
		.trim()
		.notEmpty()
		.withMessage(validationErrorMessages.empty)
		.bail()
		.isInt()
		.withMessage(validationErrorMessages.numeric)
		.bail()
		.isLength({ min: 6, max: 6 })
		.withMessage(validationErrorMessages.pinLength),
	validateCoordinates('location.lat'),
	validateCoordinates('location.long')
]
