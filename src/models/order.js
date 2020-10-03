import { Schema, model } from 'mongoose'
import chance from 'chance'

const orderSchema = new Schema(
	{
		apartment: {
			id: {
				type: Schema.Types.ObjectId,
				ref: 'apartment',
				required: true
			},
			aptName: { type: String, required: true },
			area: { type: String, required: true },
			city: { type: String, required: true },
			state: { type: String, required: true },
			pincode: { type: String, required: true, match: [/^\d{6}/] }
		},
		buyer: {
			id: { type: Schema.Types.ObjectId, ref: 'user', required: true },
			name: { type: String, required: true },
			house: { type: String, required: true },
			phone: {
				type: String,
				required: true,
				match: [/^9\d{9}$/, 'Please provide a valid 10 digit mobile number'] // Phone number validation
			},
			whatsapp: {
				type: String,
				required: true,
				match: [/^9\d{9}$/, 'Please provide a valid 10 digit mobile number'] // Phone number validation
			},
			email: String,
			pushToken: String // used to send mobile notifications
		},
		seller: {
			id: { type: Schema.Types.ObjectId, ref: 'seller' },
			brandName: { type: String, required: true },
			phone: {
				type: String,
				required: true,
				match: [/^9\d{9}$/, 'Please provide a valid 10 digit mobile number'] // Phone number validation
			},
			whatsapp: {
				type: String,
				required: true,
				match: [/^9\d{9}$/, 'Please provide a valid 10 digit mobile number']
			},
			email: String,
			pushToken: String
		},
		order: {
			number: {
				type: String,
				default: chance().integer({ min: 100000, max: 999999 })
			},
			status: {
				type: String,
				enum: ['open', 'out', 'delayed', 'delivered', 'cancelled'],
				default: 'open',
				required: true
			},
			totalAmount: {
				type: Number,
				required: true
			},
			orderDate: {
				type: Date,
				default: new Date()
			},
			expectedDeliveryDate: {
				type: Date,
				required: true
			},
			actualDeliveryDate: Date,
			products: [
				{
					name: {
						type: String,
						required: true
					},
					price: {
						type: Number,
						min: 0.0,
						required: true
					},
					unitInfo: {
						type: String,
						required: true
					},
					quantity: {
						type: Number,
						min: 0.0,
						required: true
					}
				}
			]
		}
	},
	{ timestamps: false }
)

orderSchema.virtual('address').get(function () {
	const { aptName, area, city } = this.apartment
	return `${this.buyer.house}, ${aptName}, ${area}, ${city}`
})

export const Order = model('order', orderSchema)
