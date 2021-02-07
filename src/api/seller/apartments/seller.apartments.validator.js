import {
	phoneValidator,
	emptyValidator,
	numberValidator,
	objectIdValidator,
	emailOptionalValidator,
	paramObjectIdValidator,
	emptyOptionalValidator
} from '../../../util'

export const patchApartmentValidator = [
	objectIdValidator('apartmentId'),
	emptyValidator('live').isBoolean().withMessage('either true or false')
]

export const patchDeliveryValidator = [
	objectIdValidator('apartmentId'),
	emptyValidator('deliveryType')
		.matches(/^(duration|day)$/)
		.withMessage('should be either duration or day'),
	numberValidator('day')
		.custom(val => val >= 1 && val <= 7)
		.withMessage(
			'day should be in range 1-7 with 1 for Sunday, 2 for Monday & so on'
		),
	emptyOptionalValidator('slot')
]

export const patchContactInfoValidator = [
	objectIdValidator('apartmentId'),
	phoneValidator('phone'),
	phoneValidator('whatsapp'),
	emailOptionalValidator('email')
]

export const deleteApartmentValidator = [paramObjectIdValidator('apartmentId')]
