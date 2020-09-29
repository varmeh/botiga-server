import moment from 'moment'
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

apartmentSellerSchema.virtual('deliveryMessage').get(function () {
	const { type, day } = this.delivery
	return type === 'delay'
		? `Delivers in ${day} day${day > 1 ? 's' : ''}`
		: `Delivers Every ${moment()
				.day(day - 1)
				.format('dddd')}`
})

apartmentSellerSchema.virtual('deliveryDate').get(function () {
	const { type, day } = this.delivery
	let deliveryDate
	if (type === 'delay') {
		deliveryDate = moment().endOf('day').add(day, 'd')
	} else {
		// In moment dates, Sunday is 0, Monday is 1 & so on
		// In Mongodb dates, Sunday is 1, Monday is 2 & so on
		const dayOfTheWeek = moment().day()
		const deliveryDateOfThisWeek = moment()
			.day(day - 1)
			.endOf('day')

		deliveryDate =
			dayOfTheWeek < day - 1
				? deliveryDateOfThisWeek
				: deliveryDateOfThisWeek.add(1, 'weeks') // give next week delivery date
	}
	return deliveryDate.format('YYYY-MM-DD')
})
