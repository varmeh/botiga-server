import { paramEmptyValidator } from '../../util'

export const getImageUrlValidator = [
	paramEmptyValidator('imageType')
		.matches(/^(jpg|jpeg|png)$/, 'i')
		.withMessage('Valid Image Format - png, jpg and jpeg')
]
