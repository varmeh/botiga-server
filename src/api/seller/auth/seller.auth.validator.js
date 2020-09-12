import {
	emptyValidator,
	alphaValitor,
	pinValidator,
	phoneValidator
} from '../../../util'

export const pinSigninValidator = [phoneValidator('phone'), pinValidator('pin')]

export const signupValidator = [
	emptyValidator('companyName'),
	alphaValitor('businessCategory'),
	emptyValidator('firstName'),
	emptyValidator('lastName'),
	emptyValidator('gender')
		.matches(/^(male|female)$/, 'i')
		.withMessage('should be either male or female'),
	emptyValidator('brandName'),
	phoneValidator('phone'),
	pinValidator('pin')
]
