import { Router } from 'express'

import { validationMiddleware } from '../../../util'
import {
	getSellerValidator,
	getDeliveryValidator,
	patchSellerFiltesValidator,
	patchSellerBankDetailsValidator,
	postSellerApartmentValidator,
	patchSellerApartmentLiveValidator,
	deleteSellerApartmentValidator,
	deleteSellerApartmentWithIdValidator
} from './seller.admin.validator'

import {
	getSellerDetails,
	getDelivery,
	getDeliveryXlsToCustomerSupport,
	patchSellerBankDetails,
	postSellerApartment,
	patchApartmentLiveStatus,
	deleteSellerApartments,
	deleteSellerApartmentsWithId,
	patchSellerFilters
} from './seller.admin.controller'

const router = Router()

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
