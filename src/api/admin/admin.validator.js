import { isEmptyValidator, pinValidator } from '../../util'

export const validationErrorMessages = {
	addressRegex:
		'should have following characters - alphabets, numbers, comma, spaces, dot and hypen',
	decimal: 'should be decimal',
	territory: 'should have alphabets & space only'
}

const validateCoordinates = field =>
	isEmptyValidator(field)
		.isDecimal()
		.withMessage(validationErrorMessages.decimal)

const validateTeritory = field =>
	isEmptyValidator(field)
		.matches(/^[a-zA-Z\s]*$/, 'i')
		.withMessage(validationErrorMessages.territory)

export const apartmentValidator = [
	isEmptyValidator('name')
		.matches(/^[a-zA-Z0-9\s,.-]*$/, 'i')
		.withMessage(validationErrorMessages.addressRegex),
	validateTeritory('city'),
	validateTeritory('area'),
	validateTeritory('state'),
	pinValidator('pincode'),
	validateCoordinates('location.lat'),
	validateCoordinates('location.long')
]
