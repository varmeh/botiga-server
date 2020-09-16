import { Schema } from 'mongoose'

export const apartmentSellerSchema = new Schema({
	_id: { type: Schema.Types.ObjectId, ref: 'seller' },
	brandName: { type: String, required: true },
	tagline: String,
	brandImageUrl: String,
	businessCategory: { type: String, required: true },
	live: { type: Boolean, default: false },
	contact: {
		phone: {
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
	delivery: {
		type: {
			type: String,
			required: true,
			enum: ['delay', 'day']
		},
		// value depends on type. for
		day: {
			type: Number,
			min: 1,
			max: 7
		}
	}
})
