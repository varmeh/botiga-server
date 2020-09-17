import {
	emptyValidator,
	pinValidator,
	phoneValidator,
	alphaNumericValidator
} from '../../../util'

export const signinPinValidator = [phoneValidator('phone'), pinValidator('pin')]

export const signupValidator = [
	emptyValidator('firstName'),
	emptyValidator('lastName'),
	emptyValidator('gender')
		.matches(/^(male|female)$/, 'i')
		.withMessage('should be either male or female'),
	phoneValidator('phone'),
	pinValidator('pin'),
	emptyValidator('house'),
	alphaNumericValidator('apartmentId')
]
