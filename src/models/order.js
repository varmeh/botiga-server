import { Schema, model } from 'mongoose'

const orderSchema = new Schema(
	{
		buyer: {
			id: { type: Schema.Types.ObjectId, ref: 'user' },
			name: { type: String, required: true },
			deliveryAddress: {
				house: { type: String, required: true },
				aptName: { type: String, required: true },
				area: { type: String, required: true },
				city: { type: String, required: true },
				state: { type: String, required: true },
				pincode: { type: String, required: true, match: [/^\d{6}/] }
			},
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
			email: String
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
			email: String
		},
		order: {
			id: {
				type: String,
				required: true,
				trim: true
			},
			status: {
				type: String,
				enum: ['open', 'out', 'delayed', 'delivered', 'cancelled'],
				default: 'open',
				required: true
			},
			totalAmount: {
				type: String,
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
			deliveryDate: Date,
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
	const { house, aptName, area, city } = this.buyer.deliveryAddress
	return `${house}, ${aptName}, ${area}, ${city}`
})

export const Order = model('order', orderSchema)
