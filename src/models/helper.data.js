import CreateHttpError from 'http-errors'
import { Schema, model } from 'mongoose'
import { winston } from '../util'

const helperDataSchema = new Schema({
	businessCategory: [String],
	sellerFilters: [{ key: String, val: String }]
})

export const HelperData = model('helperData', helperDataSchema, 'helperData')

export const findHelperData = async () => {
	try {
		return await HelperData.findOne()
	} catch (error) {
		winston.debug('@error getBusinessCategories', {
			error,
			msg: error?.message
		})
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const createBusinessCategory = async newBusinessCategory => {
	try {
		const helperData = await HelperData.findOne()
		if (helperData.businessCategory.includes(newBusinessCategory)) {
			return Promise.reject(CreateHttpError[409]('Category already exists'))
		}
		helperData.businessCategory.push(newBusinessCategory)
		await helperData.save()

		// Sort them
		return await HelperData.updateOne({
			$push: {
				businessCategory: { $each: [], $sort: 1 }
			}
		})
	} catch (error) {
		winston.debug('@error createBusinessCategory', {
			error,
			msg: error?.message
		})
		return Promise.reject(new CreateHttpError[500]())
	}
}
