import { Router } from 'express'
import { validationMiddleware } from '../../util'

import sellerAdminRouter from './seller/seller.admin.routes'
import authRouter from './auth/admin.auth.routes'

import {
	getApartmentValidator,
	postApartmentValidator,
	postApartmentBannerValidator,
	deleteApartmentBannerValidator,
	postBusinessCategoryValidator,
	postNotificationTopicValidator,
	postNotificationUserValidator,
	postTestTransactionValidator,
	postTestTransactionNotifyValidator,
	deleteImageValidator,
	getOrdersByPhoneValidator,
	getOrdersByOrderNumberValidator
} from './admin.validator'

import {
	getApartment,
	postApartment,
	postApartmentBanner,
	deleteApartmentBanner,
	postBusinessCategory,
	postNotificationTopic,
	postNotificationUser,
	postNotificationSeller,
	postTestTransaction,
	postTestTransactionNotify,
	postBannerImage,
	postImageDelete,
	getOrderByOrderNumber,
	getOrdersByPhoneNumber
} from './admin.controller'

const router = Router()

router.use('/auth', authRouter)
router.use('/seller', sellerAdminRouter)

router.get(
	'/apartments/:apartmentId',
	getApartmentValidator,
	validationMiddleware,
	getApartment
)

router.post(
	'/apartments',
	postApartmentValidator,
	validationMiddleware,
	postApartment
)

router.post(
	'/apartments/banners',
	postApartmentBannerValidator,
	validationMiddleware,
	postApartmentBanner
)

router.delete(
	'/apartments/:apartmentId/banners/:bannerId',
	deleteApartmentBannerValidator,
	validationMiddleware,
	deleteApartmentBanner
)

router.post('/banners/image', postBannerImage)

router.post(
	'/image/delete',
	deleteImageValidator,
	validationMiddleware,
	postImageDelete
)

router.post(
	'/businessCategory',
	postBusinessCategoryValidator,
	validationMiddleware,
	postBusinessCategory
)

router.post(
	'/notification/topic',
	postNotificationTopicValidator,
	validationMiddleware,
	postNotificationTopic
)

router.post(
	'/notification/user',
	postNotificationUserValidator,
	validationMiddleware,
	postNotificationUser
)

router.post(
	'/notification/seller',
	postNotificationUserValidator,
	validationMiddleware,
	postNotificationSeller
)

router.post(
	'/transaction/test',
	postTestTransactionValidator,
	validationMiddleware,
	postTestTransaction
)

router.post(
	'/transaction/test/notify',
	postTestTransactionNotifyValidator,
	validationMiddleware,
	postTestTransactionNotify
)

router.get(
	'/orders/order/:number',
	getOrdersByOrderNumberValidator,
	validationMiddleware,
	getOrderByOrderNumber
)

router.get(
	'/orders/phone/:number',
	getOrdersByPhoneValidator,
	validationMiddleware,
	getOrdersByPhoneNumber
)

export default router
