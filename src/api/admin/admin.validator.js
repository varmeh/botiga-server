import {
	addressValidator,
	pincodeValidator,
	decimalValidator,
	alphaSpaceValidator
} from '../../util'

export const apartmentValidator = [
	addressValidator('name'),
	alphaSpaceValidator('city'),
	alphaSpaceValidator('area'),
	alphaSpaceValidator('state'),
	pincodeValidator('pincode'),
	decimalValidator('location.lat'),
	decimalValidator('location.long')
]
