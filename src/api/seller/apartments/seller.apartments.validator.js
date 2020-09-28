import {
	phoneValidator,
	emptyValidator,
	numberValidator,
	objectIdValidator
} from '../../../util'

export const postApartmentValidator = [
	objectIdValidator('apartmentId'),
	phoneValidator('phone'),
	phoneValidator('whatsapp'),
	emptyValidator('deliveryType')
		.matches(/^(delay|day)$/)
		.withMessage('should be either delay or day'),
	numberValidator('day')
		.custom(val => val >= 1 && val <= 7)
		.withMessage('day should be in range 1-7')
]

export const patchApartmentValidator = [
	objectIdValidator('apartmentId'),
	emptyValidator('live').isBoolean().withMessage('either true or false')
]
