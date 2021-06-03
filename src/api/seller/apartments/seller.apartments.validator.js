import { DeliveryType } from '../../../models'

import {
	phoneValidator,
	emptyValidator,
	numberValidator,
	objectIdValidator,
	emailOptionalValidator,
	paramObjectIdValidator,
	emptyOptionalValidator,
	boolValidator
} from '../../../util'

export const patchApartmentValidator = [
	objectIdValidator('apartmentId'),
	emptyValidator('live').isBoolean().withMessage('either true or false')
]

export const patchDeliveryValidator = [
	objectIdValidator('apartmentId'),
	emptyValidator('deliveryType')
		.isIn([DeliveryType.duration, DeliveryType.weeklySchedule])
		.withMessage('should be either duration or weeklySchedule'),
	numberValidator('day')
		.custom(val => val >= 1 && val <= 7)
		.withMessage('day should be in range 1-7'),
	boolValidator('weekly.sun'),
	boolValidator('weekly.mon'),
	boolValidator('weekly.tue'),
	boolValidator('weekly.wed'),
	boolValidator('weekly.thu'),
	boolValidator('weekly.fri'),
	boolValidator('weekly.sat'),
	emptyOptionalValidator('slot')
]

export const patchContactInfoValidator = [
	objectIdValidator('apartmentId'),
	phoneValidator('phone'),
	phoneValidator('whatsapp'),
	emailOptionalValidator('email')
]

export const deleteApartmentValidator = [paramObjectIdValidator('apartmentId')]
