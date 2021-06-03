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
				required: true
			},
			whatsapp: String,
			email: String
		},
		seller: {
			id: { type: Schema.Types.ObjectId, ref: 'seller' },
			brandName: { type: String, required: true },
			phone: {
				type: String,
				required: true
			},
			whatsapp: {
				type: String,
				required: true
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
			discountAmount: {
				type: Number,
				default: 0
			},
			deliveryFee: {
				type: Number,
				default: 0
			},
			couponCode: String,
			expectedDeliveryDate: {
				type: Date,
				required: true
			},
			deliverySlot: String,
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
			paymentMode: String,
			status: {
				type: String,
				enum: [
					PaymentStatus.initiated,
					PaymentStatus.success,
					PaymentStatus.failure
				]
			},
			description: {
				type: String,
				default: ''
			},
			transferredAmount: {
				type: Number,
				default: 0
			},
			transferId: {
				type: String,
				default: ''
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
