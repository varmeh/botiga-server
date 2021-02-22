import { Router } from 'express'
import { validationMiddleware } from '../../util'
import {
	getApartmentValidator,
	postApartmentValidator,
	patchApartmentBannersValidator,
	postBusinessCategoryValidator,
	postNotificationTopicValidator,
	postNotificationUserValidator,
	getSellerValidator,
	patchSellerBankDetailsValidator,
	postTestTransactionValidator,
	postTestTransactionNotifyValidator,
	getDeliveryValidator,
	postSellerApartmentValidator,
	patchSellerApartmentLiveValidator,
	deleteSellerApartmentValidator,
	deleteSellerApartmentWithIdValidator
} from './admin.validator'

import {
	getApartment,
	postApartment,
	patchApartmentBanners,
	postBusinessCategory,
	postNotificationTopic,
	postNotificationUser,
	postNotificationSeller,
	getSellerDetails,
	patchSellerBankDetails,
	postTestTransaction,
	postTestTransactionNotify,
	getDeliveryXls,
	postSellerApartment,
	patchApartmentLiveStatus,
	deleteSellerApartments,
	deleteSellerApartmentsWithId
} from './admin.controller'

const router = Router()

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

router.patch(
	'/apartments/banners',
	patchApartmentBannersValidator,
	validationMiddleware,
	patchApartmentBanners
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

router.post(
	'/seller/apartment',
	postSellerApartmentValidator,
	validationMiddleware,
	postSellerApartment
)

router.patch(
	'/seller/apartment/live',
	patchSellerApartmentLiveValidator,
	validationMiddleware,
	patchApartmentLiveStatus
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

export default router
