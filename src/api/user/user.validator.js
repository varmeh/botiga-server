import { paramEmptyValidator, paramObjectIdValidator } from '../../util'

export const getSellerValidator = paramEmptyValidator('apartmentId')

export const getProductsValidator = paramObjectIdValidator('sellerId')
