import { Schema, model } from 'mongoose'
import { categorySchema } from './categorySchema'

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
	deliveryMessage: String
})

const sellerSchema = new Schema(
	{
		businessName: { type: String, required: true, immutable: true },
		businessCategory: { type: String, required: true },
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
			imageUrl: String
		},
		loginPin: { type: String },
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
			beneficiaryName: String,
			accountNumber: String,
			ifscCode: String,
			bankName: String
		},
		mid: String, // paytm merchant id for split payments. Separated from bank details to avoid encryption
		categories: [categorySchema],
		apartments: [sellerApartmentSchema]
	},
	{ timestamps: true }
)

sellerSchema.virtual('isBankDetailVerified').get(function () {
	return !!this.mid
})

export const Seller = model('seller', sellerSchema)
