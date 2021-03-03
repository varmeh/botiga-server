import { Router } from 'express'
import { validationMiddleware, token } from '../../../util'
import {
	patchContactValidator,
	patchBusinessValidator,
	patchBankDetailsValidator,
	patchBannersValidator,
	postCouponsValidator,
	patchCouponsValidator,
	deleteCouponValidator
} from './seller.profile.validator'
import {
	getProfileInformation,
	getContactInformation,
	patchContactInformation,
	getBusinessInformation,
	patchBusinessInformation,
	getBankDetails,
	patchBankDetails,
	getBanners,
	patchBanners,
	patchBannerImage,
	getCoupons,
	postCoupon,
	patchCoupon,
	deleteCoupon
} from './seller.profile.controller'

const router = Router()

router.get('/', token.authenticationMiddleware, getProfileInformation)

router.get('/contact', token.authenticationMiddleware, getContactInformation)

router.patch(
	'/contact',
	token.authenticationMiddleware,
	patchContactValidator,
	validationMiddleware,
	patchContactInformation
)

router.get('/business', token.authenticationMiddleware, getBusinessInformation)

router.patch(
	'/business',
	token.authenticationMiddleware,
	patchBusinessValidator,
	validationMiddleware,
	patchBusinessInformation
)

router.get('/bankdetails', token.authenticationMiddleware, getBankDetails)

router.patch(
	'/bankdetails',
	token.authenticationMiddleware,
	patchBankDetailsValidator,
	validationMiddleware,
	patchBankDetails
)

router.get('/banners', token.authenticationMiddleware, getBanners)

router.patch(
	'/banners/images',
	token.authenticationMiddleware,
	patchBannerImage
)

router.patch(
	'/banners',
	token.authenticationMiddleware,
	patchBannersValidator,
	validationMiddleware,
	patchBanners
)

router.get('/coupons', token.authenticationMiddleware, getCoupons)
router.delete(
	'/coupons/:couponId',
	token.authenticationMiddleware,
	deleteCouponValidator,
	validationMiddleware,
	deleteCoupon
)

router.post(
	'/coupons',
	token.authenticationMiddleware,
	postCouponsValidator,
	validationMiddleware,
	postCoupon
)

router.patch(
	'/coupons',
	token.authenticationMiddleware,
	patchCouponsValidator,
	validationMiddleware,
	patchCoupon
)

export default router
