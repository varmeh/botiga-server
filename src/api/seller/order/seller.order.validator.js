import { objectIdValidator } from '../../../util'

export const postCancelOrderValidator = [objectIdValidator('orderId')]
