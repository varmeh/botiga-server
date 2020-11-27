import {
	paramEmptyValidator,
	urlValidator,
	paramObjectIdValidator
} from '../../util'

export const getApartmentValidator = paramObjectIdValidator('apartmentId')

export const getImageUrlValidator = [
	paramEmptyValidator('imageType')
		.matches(/^(jpg|jpeg|png)$/, 'i')
		.withMessage('Valid Image Format - png, jpg and jpeg')
]

export const postImageUrlValidator = urlValidator('imageUrl')
