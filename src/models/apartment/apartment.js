import { Schema, model } from 'mongoose'
import { apartmentSellerSchema } from './apartmentSellerSchema'

const marketingBannerSchema = new Schema({
	url: {
		type: String,
		required: true
	},
	sellerId: { type: Schema.Types.ObjectId, ref: 'seller' }
})

marketingBannerSchema.method('toJSON', function () {
	const obj = this.toObject()

	// Rename _id field
	obj.id = obj._id
	delete obj._id

	return obj
})

const apartmentSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			unique: true
		},
		area: {
			type: String,
			required: true
		},
		city: {
			type: String,
			required: true
		},
		state: {
			type: String,
			required: true
		},
		pincode: { type: String, match: [/^\d{6}/] },
		location: {
			type: {
				type: String,
				enum: ['Point'],
				required: true
			},
			coordinates: {
				type: [Number],
				required: true
			}
		},
		sellers: [apartmentSellerSchema],
		marketingBanners: [marketingBannerSchema]
	},
	{ timestamps: true }
)
export const Apartment = model('apartment', apartmentSchema)
