import { Router } from 'express'

import { validationMiddleware } from '../../../util'

import { adminAuthMiddleware } from '../model'

import {
	getSellerValidator,
	getDeliveryValidator,
	patchSellerFiltesValidator,
	patchDeliveryFeeValidator,
	patchDeliveryScheduleValidator,
	patchSellerBankDetailsValidator,
	postSellerApartmentValidator,
	postSellerApartmentConfigureValidator,
	patchSellerApartmentLiveValidator,
	deleteSellerApartmentValidator,
	deleteSellerApartmentWithIdValidator,
	getNotificationValidator,
	patchNotificationValidator,
	patchHomeBrandingValidator
} from './seller.admin.validator'

import {
	getApprovedSellers,
	getSellerDetails,
	getDelivery,
	patchSellerFilters,
	patchDeliveryFee,
	patchDeliverySchedule,
	getDeliveryXlsToCustomerSupport,
	patchSellerBankDetails,
	postSellerApartment,
	postSellerConfigureApartment,
	patchApartmentLiveStatus,
	deleteSellerApartments,
	deleteSellerApartmentsWithId,
	getNotificationDetails,
	patchNotificationDetails,
	patchHomeBranding
} from './seller.admin.controller'

const router = Router()

router.get('/approved', adminAuthMiddleware, getApprovedSellers)

router.get(
	'/:phone',
	adminAuthMiddleware,
	getSellerValidator,
	validationMiddleware,
	getSellerDetails
)

router.get(
	'/delivery/:sellerPhone/:date',
	adminAuthMiddleware,
	getDeliveryValidator,
	validationMiddleware,
	getDelivery
)

router.get(
	'/deliveryxls/:sellerPhone/:date',
	// adminAuthMiddleware,
	getDeliveryValidator,
	validationMiddleware,
	getDeliveryXlsToCustomerSupport
)

router.patch(
	'/filters',
	adminAuthMiddleware,
	patchSellerFiltesValidator,
	validationMiddleware,
	patchSellerFilters
)

router.patch(
	'/delivery/fee',
	adminAuthMiddleware,
	patchDeliveryFeeValidator,
	validationMiddleware,
	patchDeliveryFee
)

router.patch(
	'/delivery/schedule',
	adminAuthMiddleware,
	patchDeliveryScheduleValidator,
	validationMiddleware,
	patchDeliverySchedule
)

router.post(
	'/apartment',
	adminAuthMiddleware,
	postSellerApartmentValidator,
	validationMiddleware,
	postSellerApartment
)

router.post(
	'/apartment/configure',
	postSellerApartmentConfigureValidator,
	validationMiddleware,
	postSellerConfigureApartment
)

router.patch(
	'/apartment/live',
	adminAuthMiddleware,
	patchSellerApartmentLiveValidator,
	validationMiddleware,
	patchApartmentLiveStatus
)

router.delete(
	'/:phone/apartments/:apartmentId',
	adminAuthMiddleware,
	deleteSellerApartmentWithIdValidator,
	validationMiddleware,
	deleteSellerApartmentsWithId
)

router.delete(
	'/:phone/apartments',
	adminAuthMiddleware,
	deleteSellerApartmentValidator,
	validationMiddleware,
	deleteSellerApartments
)

router.patch(
	'/bankdetails',
	adminAuthMiddleware,
	patchSellerBankDetailsValidator,
	validationMiddleware,
	patchSellerBankDetails
)

router.get(
	'/notification/:phone',
	adminAuthMiddleware,
	getNotificationValidator,
	validationMiddleware,
	getNotificationDetails
)

router.patch(
	'/notification',
	adminAuthMiddleware,
	patchNotificationValidator,
	validationMiddleware,
	patchNotificationDetails
)

router.patch(
	'/home/branding',
	adminAuthMiddleware,
	patchHomeBrandingValidator,
	validationMiddleware,
	patchHomeBranding
)

export default router
