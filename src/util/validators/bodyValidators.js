import moment from 'moment'
import { body } from 'express-validator'
import { validationMessages } from './validationMessages'

export const fieldExists = field =>
	body(field).exists().withMessage(validationMessages.mandatoryField).bail()

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

export const imageUrlArrayValidator = (field, maxLength) =>
	body(field)
		.custom(arr => Array.isArray(arr))
		.withMessage(validationMessages.array)
		.bail()
		.custom(arr => arr.length <= maxLength)
		.withMessage(`should have less than ${maxLength} images`)
		.bail()
		.custom(arr => {
			let isValidArrayOfUrls = true
			arr.forEach(val => {
				if (!val.startsWith('https://')) {
					isValidArrayOfUrls = false
				}
			})
			return isValidArrayOfUrls
		})
		.withMessage('should have valid urls')

export const objectIdArrayValidator = field =>
	arrayValidator(field)
		.bail()
		.custom(arr => {
			let isValidArrayOfObjectIds = true
			arr.forEach(val => {
				if (!val.match(/^[0-9a-fA-F]{24}$/g)) {
					isValidArrayOfObjectIds = false
				}
			})
			return isValidArrayOfObjectIds
		})
		.withMessage('should have valid ObjectIds')
