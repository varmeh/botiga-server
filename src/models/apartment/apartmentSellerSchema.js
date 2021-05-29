import { Schema } from 'mongoose'
import { moment } from '../../util'

export const apartmentSellerSchema = new Schema({
	_id: { type: Schema.Types.ObjectId, ref: 'seller' },
	brandName: { type: String, required: true },
	tagline: String,
	brandImageUrl: String,
	businessCategory: { type: String, required: true },
	live: { type: Boolean, default: false },
	filters: [String],
	contact: {
		phone: {
			type: String,
			required: true
		},
		whatsapp: {
			type: String,
			required: true,
			match: [/^[5-9]\d{9}$/, 'Please provide a valid 10 digit mobile number']
		},
		email: String,
		address: String
	},
	fssaiLicenseNumber: String,
	delivery: {
		type: {
			type: String,
			required: true,
			enum: ['duration', 'day']
		},
		// value depends on type. for
		day: {
			type: Number,
			min: 1,
			max: 7
		},
		slot: String,
		minOrder: {
			type: Number,
			default: 0,
			max: 1000
		},
		fee: {
			type: Number,
			default: 0,
			max: 50
		}
	}
})

const deliveryDate = (type, day) => {
	let deliveryDate
	if (type === 'duration') {
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
}

apartmentSellerSchema.virtual('deliveryDate').get(function () {
	const { type, day } = this.delivery
	return deliveryDate(type, day)
})

const deliveryMessage = (type, day) => {
	return type === 'duration'
		? `Delivers in ${day} day${day > 1 ? 's' : ''}`
		: `Delivers Every ${moment()
				.day(day - 1)
				.format('dddd')}`
}

apartmentSellerSchema.virtual('deliveryMessage').get(function () {
	const { type, day } = this.delivery
	return deliveryMessage(type, day)
})

export const apartmentVirtuals = { deliveryMessage, deliveryDate }
