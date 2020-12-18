import { Router } from 'express'
import { validationMiddleware } from '../../util'
import {
	postApartmentValidator,
	postBusinessCategoryValidator,
	postNotificationTopicValidator,
	postNotificationUserValidator,
	getSellerValidator,
	patchSellerBankDetailsValidator,
	patchPaymentUpdateValidator,
	postTestTransactionValidator,
	getDeliveryValidator
} from './admin.validator'

import {
	postApartment,
	postBusinessCategory,
	postNotificationTopic,
	postNotificationUser,
	postNotificationSeller,
	getSellerDetails,
	patchSellerBankDetails,
	patchPaymentUpdate,
	postTestTransaction,
	getTransactionStatus,
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
	getSellerValidator,
	validationMiddleware,
	getSellerDetails
)

router.patch(
	'/seller/bankdetails',
	patchSellerBankDetailsValidator,
	validationMiddleware,
	patchSellerBankDetails
)

router.patch(
	'/payment/update',
	patchPaymentUpdateValidator,
	validationMiddleware,
	patchPaymentUpdate
)

router.post(
	'/transaction/test',
	postTestTransactionValidator,
	validationMiddleware,
	postTestTransaction
)

router.get('/transaction/status', getTransactionStatus)

router.get(
	'/delivery/:sellerPhone/:date',
	getDeliveryValidator,
	validationMiddleware,
	getDeliveryXls
)

router.get('/email', testEmail)

export default router
