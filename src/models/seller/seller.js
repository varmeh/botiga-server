import { Schema, model } from 'mongoose'
import { notifications } from '../../util'
import { categorySchema } from './categorySchema'

export const AccountType = {
	current: 'current',
	savings: 'savings'
}

export const sellerApartmentSchema = new Schema({
	_id: {
		// Same as apartmentId _id in apartment schema
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'apartment'
	},
	apartmentName: {
		type: String,
		required: true
	},
	apartmentArea: {
		type: String,
		required: true
	},
	live: {
		type: Boolean,
		default: false
	},
	contact: {
		phone: {
			type: String,
			required: true,
			match: [/^[5-9]\d{9}$/, 'Please provide a valid 10 digit mobile number'] // Phone number validation
		},
		whatsapp: {
			type: String,
			required: true,
			match: [/^[5-9]\d{9}$/, 'Please provide a valid 10 digit mobile number']
		},
		email: String
	},
	deliveryMessage: String,
	deliverySlot: String,
	deliveryFee: {
		type: Number,
		default: 0
	},
	deliveryMinOrder: {
		type: Number,
		default: 0
	}
})

export const CouponDiscountType = {
	percentage: 'percentage',
	value: 'value'
}

const couponSchema = new Schema({
	couponCode: { type: String, required: true },
	discountType: {
		type: String,
		enum: [CouponDiscountType.percentage, CouponDiscountType.value],
		required: true
	},
	discountValue: {
		type: Number,
		required: true
	},
	minimumOrderValue: {
		type: Number,
		default: 0
	},
	maxDiscountAmount: {
		type: Number,
		default: 0
	},
	expiryDate: {
		type: Date,
		required: true
	},
	visibleToAllCustomers: {
		type: Boolean,
		default: true
	}
})

couponSchema.method('toJSON', function () {
	const obj = this.toObject()

	// Rename _id field
	obj.couponId = obj._id
	delete obj._id

	return obj
})

const sellerSchema = new Schema(
	{
		businessName: { type: String, required: true, immutable: true },
		businessCategory: { type: String, required: true },
		businessType: { type: String, required: true },
		gstin: { type: String, required: true },
		fssai: {
			number: String,
			validity: Date,
			certificateUrls: [String]
		},
		owner: {
			firstName: {
				type: String,
				required: true,
				trim: true
			},
			lastName: {
				type: String,
				required: true,
				trim: true
			}
		},
		brand: {
			name: { type: String, required: true },
			tagline: String,
			imageUrl: String,
			homeImageUrl: String,
			homeTagline: String
		},
		contact: {
			email: String,
			countryCode: {
				type: String,
				required: true,
				default: '91'
			},
			phone: {
				type: String,
				unique: true,
				required: [true, 'phone number is mandatory'],
				immutable: true,
				match: [/^[5-9]\d{9}$/, 'Please provide a valid 10 digit mobile number'] // Phone number validation
			},
			whatsapp: {
				type: String,
				required: [true, 'Whatsapp Number is mandatory'],
				match: [/^[5-9]\d{9}$/, 'Please provide a valid 10 digit mobile number']
			},
			address: {
				building: String,
				street: String,
				area: String,
				city: String,
				state: String,
				pincode: { type: String, match: [/^\d{6}/] }
			},
			pushTokens: [String]
		},
		bankDetails: {
			editable: {
				type: Boolean,
				default: true
			},
			verified: {
				type: Boolean,
				default: false
			},
			beneficiaryName: String,
			accountNumber: String,
			accountType: {
				type: String,
				enum: [AccountType.current, AccountType.savings],
				default: AccountType.current
			},
			ifscCode: String,
			bankName: String
		},
		mid: String, // paytm merchant id for split payments. Separated from bank details to avoid encryption
		filters: [String],
		recommendedProducts: {
			allowed: {
				type: Number,
				default: 0
			},
			selected: {
				type: Number,
				default: 0
			}
		},
		categories: [categorySchema],
		apartments: [sellerApartmentSchema],
		banners: [String],
		coupons: [couponSchema],
		notification: {
			title: {
				type: String,
				default: ''
			},
			content: {
				type: String,
				default: ''
			},
			imageUrl: {
				type: String,
				default: ''
			}
		}
	},
	{ timestamps: true }
)

sellerSchema.pre('validate', function (next) {
	if (this.banners.length > 3)
		throw new Error('exceeds maximum number of banners allowed')
	next()
})

sellerSchema.virtual('bankDetailsVerified').get(function () {
	return !!this.bankDetails.verified
})

sellerSchema.methods.sendNotifications = function (title, body, orderId) {
	this.contact.pushTokens.forEach(token =>
		notifications.sendToDevice(token, title, body, orderId)
	)
}

export const Seller = model('seller', sellerSchema)
