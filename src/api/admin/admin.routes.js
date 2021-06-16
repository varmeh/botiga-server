import { Router } from 'express'
import { validationMiddleware } from '../../util'

import sellerAdminRouter from './seller/seller.admin.routes'
import authRouter from './auth/admin.auth.routes'
import { adminAuthMiddleware } from './model'

import {
	getApartmentValidator,
	postApartmentValidator,
	postApartmentBannerValidator,
	postApartmentCopyValidator,
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
	postApartmentsCopy,
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
	adminAuthMiddleware,
	getApartmentValidator,
	validationMiddleware,
	getApartment
)

router.post(
	'/apartments',
	adminAuthMiddleware,
	postApartmentValidator,
	validationMiddleware,
	postApartment
)

router.post(
	'/apartments/banners',
	adminAuthMiddleware,
	postApartmentBannerValidator,
	validationMiddleware,
	postApartmentBanner
)

router.post(
	'/apartments/copy',
	postApartmentCopyValidator,
	validationMiddleware,
	postApartmentsCopy
)

router.delete(
	'/apartments/:apartmentId/banners/:bannerId',
	adminAuthMiddleware,
	deleteApartmentBannerValidator,
	validationMiddleware,
	deleteApartmentBanner
)

router.post('/banners/image', adminAuthMiddleware, postBannerImage)

router.post(
	'/image/delete',
	adminAuthMiddleware,
	deleteImageValidator,
	validationMiddleware,
	postImageDelete
)

router.post(
	'/businessCategory',
	adminAuthMiddleware,
	postBusinessCategoryValidator,
	validationMiddleware,
	postBusinessCategory
)

router.post(
	'/notification/topic',
	adminAuthMiddleware,
	postNotificationTopicValidator,
	validationMiddleware,
	postNotificationTopic
)

router.post(
	'/notification/user',
	adminAuthMiddleware,
	postNotificationUserValidator,
	validationMiddleware,
	postNotificationUser
)

router.post(
	'/notification/seller',
	adminAuthMiddleware,
	postNotificationUserValidator,
	validationMiddleware,
	postNotificationSeller
)

router.post(
	'/transaction/test',
	adminAuthMiddleware,
	postTestTransactionValidator,
	validationMiddleware,
	postTestTransaction
)

router.post(
	'/transaction/test/notify',
	adminAuthMiddleware,
	postTestTransactionNotifyValidator,
	validationMiddleware,
	postTestTransactionNotify
)

router.get(
	'/orders/order/:number',
	adminAuthMiddleware,
	getOrdersByOrderNumberValidator,
	validationMiddleware,
	getOrderByOrderNumber
)

router.get(
	'/orders/phone/:number',
	adminAuthMiddleware,
	getOrdersByPhoneValidator,
	validationMiddleware,
	getOrdersByPhoneNumber
)

export default router
