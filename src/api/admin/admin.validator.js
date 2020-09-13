import {
	addressValidator,
	pinValidator,
	decimalValidator,
	alphaSpaceValidator
} from '../../util'

export const apartmentValidator = [
	addressValidator('name'),
	alphaSpaceValidator('city'),
	alphaSpaceValidator('area'),
	alphaSpaceValidator('state'),
	pinValidator('pincode'),
	decimalValidator('location.lat'),
	decimalValidator('location.long')
]
