import { Schema, model } from 'mongoose'

export const OrderStatus = {
	open: 'open',
	outForDelivery: 'out',
	delayed: 'delayed',
	delivered: 'delivered',
	cancelled: 'cancelled'
}

export const PaymentStatus = {
	initiated: 'initiated',
	success: 'success',
	failure: 'failure'
}

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
				match: [/^[5-9]\d{9}$/, 'Please provide a valid 10 digit mobile number'] // Phone number validation
			},
			whatsapp: String,
			email: String
		},
		seller: {
			id: { type: Schema.Types.ObjectId, ref: 'seller' },
			brandName: { type: String, required: true },
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
			email: String,
			accountId: String
		},
		order: {
			number: {
				type: String,
				required: true
			},
			status: {
				type: String,
				enum: [
					OrderStatus.open,
					OrderStatus.outForDelivery,
					OrderStatus.delayed,
					OrderStatus.delivered,
					OrderStatus.cancelled
				],
				default: OrderStatus.open,
				required: true
			},
			totalAmount: {
				type: Number,
				required: true
			},
			expectedDeliveryDate: {
				type: Date,
				required: true
			},
			completionDate: Date,
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
		},
		payment: {
			orderId: String,
			paymentId: String,
			txnAmount: String,
			status: {
				type: String,
				enum: [
					PaymentStatus.initiated,
					PaymentStatus.success,
					PaymentStatus.failure
				]
			}
		},
		refund: {
			status: {
				type: String,
				enum: [
					PaymentStatus.initiated,
					PaymentStatus.success,
					PaymentStatus.failure
				]
			},
			id: String,
			date: Date,
			amount: String
		}
	},
	{ timestamps: true }
)

orderSchema.virtual('address').get(function () {
	const { aptName, area, city } = this.apartment
	return `${this.buyer.house}, ${aptName}, ${area}, ${city}`
})

export const Order = model('order', orderSchema)
