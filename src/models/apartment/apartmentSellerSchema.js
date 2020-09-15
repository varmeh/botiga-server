import { Schema } from 'mongoose'

export const apartmentSellerSchema = new Schema({
	sellerId: { type: Schema.Types.ObjectId, ref: 'seller' },
	brandName: { type: String, required: true },
	tagline: String,
	brandImageUrl: String,
	businessCategory: { type: String, required: true },
	live: { type: Boolean, default: true },
	manager: {
		phoneNumber: {
			type: String,
			required: true,
			match: [/^9\d{9}$/, 'Please provide a valid 10 digit mobile number'] // Phone number validation
		},
		whatsapp: {
			type: String,
			required: true,
			match: [/^9\d{9}$/, 'Please provide a valid 10 digit mobile number']
		}
	},
	deliverySchedule: {
		deliveryType: {
			type: String,
			required: true,
			enum: ['fixedDelay', 'fixedDays'],
			default: 'fixedDelay'
		},
		fixedDelayInDays: {
			type: Number,
			default: 1
		},
		fixedDays: {
			type: Number,
			min: 1, // represents a Sunday
			max: 7 // represents a Saturday
		}
	}
})
