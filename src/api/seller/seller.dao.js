import CreateHttpError from 'http-errors'
import { winston } from '../../util'
import { Seller } from '../../models'

export const createCategory = async (sellerId, categoryName) => {
	try {
		const seller = await Seller.findById(sellerId)
		seller.products.push({ name: categoryName })
		return seller.save()
	} catch (error) {
		winston.debug('@error createCategory', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}
