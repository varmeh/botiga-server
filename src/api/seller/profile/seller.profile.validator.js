import {
	phoneOptionalValidator,
	pincodeOptionalValidator,
	emailOptionalValidator,
	emptyValidator,
	boolValidator,
	alphaNumericValidator,
	emptyOptionalValidator,
	urlOptionalValidator,
	imageUrlArrayOptionalValidator,
	objectIdValidator,
	numberValidator,
	numberOptionalValidator,
	dateValidator,
	boolOptionalValidator,
	paramObjectIdValidator
} from '../../../util'

export const patchContactValidator = [
	emailOptionalValidator('email'),
	phoneOptionalValidator('phone'),
	phoneOptionalValidator('whatsapp'),
	emptyOptionalValidator('address.building'),
	emptyOptionalValidator('address.street'),
	emptyOptionalValidator('address.city'),
	emptyOptionalValidator('address.area'),
	emptyOptionalValidator('address.state'),
	pincodeOptionalValidator('address.pincode')
]

export const patchBusinessValidator = [
	emptyValidator('brandName'),
	emptyValidator('tagline'),
	urlOptionalValidator('imageUrl'),
	boolValidator('updateImage'),
	emptyOptionalValidator('gstin'),
	emptyOptionalValidator('fssaiNumber'),
	emptyOptionalValidator('fssaiValidityDate'),
	emptyOptionalValidator('fssaiCertificateUrl')
]

export const patchBankDetailsValidator = [
	emptyValidator('beneficiaryName'),
	alphaNumericValidator('accountNumber'),
	alphaNumericValidator('ifscCode'),
	emptyValidator('bankName'),
	emptyValidator('accountType')
		.matches(/^(current|savings)$/, 'i')
		.withMessage('should be either current or savings')
]

export const patchBannersValidator = [
	imageUrlArrayOptionalValidator('banners', 3)
]

export const postCouponsValidator = [
	emptyValidator('couponCode'),
	emptyValidator('discountType')
		.matches(/^(percentage|value)$/, 'i')
		.withMessage('should be either percentage or value'),
	numberValidator('discountValue'),
	numberOptionalValidator('minimumOrderValue'),
	numberOptionalValidator('maxDiscountAmount'),
	dateValidator('expiryDate'),
	boolOptionalValidator('visibleToAllCustomers')
]

export const patchCouponsValidator = [
	objectIdValidator('couponId'),
	...postCouponsValidator
]

export const deleteCouponValidator = paramObjectIdValidator('couponId')
