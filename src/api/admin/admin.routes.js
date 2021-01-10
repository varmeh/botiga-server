import { Router } from 'express'
import { validationMiddleware } from '../../util'
import {
	postApartmentValidator,
	postBusinessCategoryValidator,
	postNotificationTopicValidator,
	postNotificationUserValidator,
	getSellerValidator,
	patchSellerBankDetailsValidator,
	postTestTransactionValidator,
	postTestTransactionNotifyValidator,
	getDeliveryValidator,
	deleteSellerApartmentValidator,
	deleteSellerApartmentWithIdValidator
} from './admin.validator'

import {
	postApartment,
	postBusinessCategory,
	postNotificationTopic,
	postNotificationUser,
	postNotificationSeller,
	getSellerDetails,
	patchSellerBankDetails,
	postTestTransaction,
	postTestTransactionNotify,
	getDeliveryXls,
	testEmail,
	deleteSellerApartments,
	deleteSellerApartmentsWithId
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

router.delete(
	'/seller/:phone/apartments/:apartmentId',
	deleteSellerApartmentWithIdValidator,
	validationMiddleware,
	deleteSellerApartmentsWithId
)

router.delete(
	'/seller/:phone/apartments',
	deleteSellerApartmentValidator,
	validationMiddleware,
	deleteSellerApartments
)

router.patch(
	'/seller/bankdetails',
	patchSellerBankDetailsValidator,
	validationMiddleware,
	patchSellerBankDetails
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
	'/delivery/:sellerPhone/:date',
	getDeliveryValidator,
	validationMiddleware,
	getDeliveryXls
)

router.get('/email', testEmail)

export default router
