import { Router } from 'express'
import { validationMiddleware } from '../../util'
import {
	postApartmentValidator,
	postBusinessCategoryValidator,
	postNotificationTopicValidator,
	postNotificationUserValidator,
	sellerPhoneValidator,
	postPaymentUpdateValidator,
	getDeliveryValidator
} from './admin.validator'

import {
	postApartment,
	postBusinessCategory,
	postNotificationTopic,
	postNotificationUser,
	postNotificationSeller,
	getSellerDetails,
	postPaymentUpdate,
	getDeliveryXls,
	testEmail
} from './admin.controller'

const router = Router()

router.post(
	'/apartments',
	postApartmentValidator,
	validationMiddleware,
	postApartment
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
	'/seller/:phone',
	sellerPhoneValidator,
	validationMiddleware,
	getSellerDetails
)

router.post(
	'/payment/update',
	postPaymentUpdateValidator,
	validationMiddleware,
	postPaymentUpdate
)

router.get(
	'/delivery/:sellerPhone/:date',
	getDeliveryValidator,
	validationMiddleware,
	getDeliveryXls
)

router.get('/email', testEmail)

export default router
