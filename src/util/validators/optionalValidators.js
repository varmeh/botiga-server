import moment from 'moment'
import { body } from 'express-validator'
import { validationMessages } from './validationMessages'

export const emptyOptionalValidator = field =>
	body(field)
		.optional({ nullable: true, checkFalsy: true })
		.trim()
		.notEmpty()
		.withMessage(validationMessages.empty)
		.bail()

export const phoneOptionalValidator = field =>
	emptyOptionalValidator(field)
		.matches(/^[5-9]\d{9}$/)
		.withMessage(validationMessages.phone)

export const pincodeOptionalValidator = field =>
	emptyOptionalValidator(field)
		.matches(/^\d{6}$/)
		.withMessage(validationMessages.length6)

export const emailOptionalValidator = field =>
	emptyOptionalValidator(field).isEmail().withMessage(validationMessages.email)

export const objectIdOptionalValidator = field =>
	emptyOptionalValidator(field)
		.matches(/^[0-9a-fA-F]{24}$/, 'i')
		.withMessage(validationMessages.objectId)

export const urlOptionalValidator = field =>
	emptyOptionalValidator(field)
		.isURL({
			protocols: ['https'],
			// eslint-disable-next-line camelcase
			require_protocol: true
		})
		.withMessage(validationMessages.url)

export const boolOptionalValidator = field =>
	emptyOptionalValidator(field)
		.isBoolean()
		.withMessage(validationMessages.bool)
		.bail()
		.toBoolean(true)

export const dateOptionalValidator = field =>
	emptyOptionalValidator(field).custom(value =>
		moment(value, 'YYYY-MM-DD', true).isValid()
			? true
			: Promise.reject(validationMessages.date)
	)

export const decimalOptionalValidator = field =>
	emptyOptionalValidator(field)
		.isDecimal()
		.withMessage(validationMessages.decimal)
		.toFloat()

export const imageUrlArrayOptionalValidator = (field, maxLength) =>
	body(field)
		.optional({ nullable: true, checkFalsy: true })
		.custom(arr => Array.isArray(arr))
		.withMessage('should be an array')
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
