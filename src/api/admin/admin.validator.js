import {
	addressValidator,
	pinValidator,
	decimalValidator,
	territoryValidator
} from '../../util'

export const apartmentValidator = [
	addressValidator('name'),
	territoryValidator('city'),
	territoryValidator('area'),
	territoryValidator('state'),
	pinValidator('pincode'),
	decimalValidator('location.lat'),
	decimalValidator('location.long')
]
