import { emptyValidator } from '../../util'

export const categoryValidator = [
	emptyValidator('name').isAlpha().withMessage('should be alphabets only')
]
