import { Router } from 'express'

import { validationMiddleware } from '../../../util'
import {
	getSellerValidator,
	getDeliveryValidator,
	patchSellerFiltesValidator,
	patchDeliveryFeeValidator,
	patchDeliveryScheduleValidator,
	patchSellerBankDetailsValidator,
	postSellerApartmentValidator,
	patchSellerApartmentLiveValidator,
	deleteSellerApartmentValidator,
	deleteSellerApartmentWithIdValidator
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
	patchApartmentLiveStatus,
	deleteSellerApartments,
	deleteSellerApartmentsWithId
} from './seller.admin.controller'

const router = Router()

router.get(
	'/approved',
	getApprovedSellers
)

router.get(
	'/:phone',
	getSellerValidator,
	validationMiddleware,
	getSellerDetails
)

router.get(
	'/delivery/:sellerPhone/:date',
	getDeliveryValidator,
	validationMiddleware,
	getDelivery
)

router.get(
	'/deliveryxls/:sellerPhone/:date',
	getDeliveryValidator,
	validationMiddleware,
	getDeliveryXlsToCustomerSupport
)

router.patch(
	'/filters',
	patchSellerFiltesValidator,
	validationMiddleware,
	patchSellerFilters
)

router.patch(
	'/delivery/fee',
	patchDeliveryFeeValidator,
	validationMiddleware,
	patchDeliveryFee
)

router.patch(
	'/delivery/schedule',
	patchDeliveryScheduleValidator,
	validationMiddleware,
	patchDeliverySchedule
)

router.post(
	'/apartment',
	postSellerApartmentValidator,
	validationMiddleware,
	postSellerApartment
)

router.patch(
	'/apartment/live',
	patchSellerApartmentLiveValidator,
	validationMiddleware,
	patchApartmentLiveStatus
)

router.delete(
	'/:phone/apartments/:apartmentId',
	deleteSellerApartmentWithIdValidator,
	validationMiddleware,
	deleteSellerApartmentsWithId
)

router.delete(
	'/:phone/apartments',
	deleteSellerApartmentValidator,
	validationMiddleware,
	deleteSellerApartments
)

router.patch(
	'/bankdetails',
	patchSellerBankDetailsValidator,
	validationMiddleware,
	patchSellerBankDetails
)

export default router
