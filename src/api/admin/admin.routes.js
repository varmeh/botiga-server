import { Router } from 'express'
import { validationMiddleware } from '../../util'
import {
	postApartmentValidator,
	postBusinessCategoryValidator,
	postNotificationTopicValidator,
	postNotificationUserValidator,
	getSellerDetailsValidator,
	postImageUrlValidator
} from './admin.validator'
import {
	postApartment,
	postImageDelete,
	postBusinessCategory,
	postNotificationTopic,
	postNotificationUser,
	postNotificationSeller,
	getSellerBankDetails
} from './admin.controller'

const router = Router()

router.post(
	'/apartments',
	postApartmentValidator,
	validationMiddleware,
	postApartment
)

router.post(
	'/image/delete',
	postImageUrlValidator,
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

router.get(
	'/seller/bankdetails/:phone',
	getSellerDetailsValidator,
	validationMiddleware,
	getSellerBankDetails
)

export default router
