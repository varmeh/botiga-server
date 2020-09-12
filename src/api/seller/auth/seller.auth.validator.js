// import { body } from 'express-validator'
import { isEmptyValidator, pinValidator, phoneValidator } from '../../../util'

export const pinSigninValidator = [phoneValidator('phone'), pinValidator('pin')]

export const signupValidator = [
	isEmptyValidator('companyName'),
	isEmptyValidator('firstName'),
	isEmptyValidator('lastName'),
	isEmptyValidator('gender')
		.matches(/^(male|female)$/, 'i')
		.withMessage('should be either male or female'),
	isEmptyValidator('brandName'),
	phoneValidator('phone'),
	pinValidator('pin')
]
