import { paramEmptyValidator, urlValidator } from '../../util'

export const getImageUrlValidator = [
	paramEmptyValidator('imageType')
		.matches(/^(jpg|jpeg|png)$/, 'i')
		.withMessage('Valid Image Format - png, jpg and jpeg')
]

export const postImageUrlValidator = urlValidator('imageUrl')
