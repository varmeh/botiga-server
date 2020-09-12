import CreateHttpError from 'http-errors'

import { password } from '../../../util'
import { dbCreateSeller, dbFindSellerByNumber } from './seller.auth.dao'

export const postSellerSignup = async (req, res, next) => {
	const {
		companyName,
		owner: { firstName, lastName, gender },
		brandName,
		phone,
		pin
	} = req.body

	try {
		const hashedPin = await password.hash(pin)
		const seller = await dbCreateSeller({
			companyName,
			firstName,
			lastName,
			gender,
			brandName,
			phone,
			hashedPin
		})
		res.json(seller)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const postSellerLoginWithPin = async (req, res, next) => {
	const { phone, pin } = req.body

	try {
		const seller = await dbFindSellerByNumber(phone, {
			owner: 1,
			brand: 1,
			contact: 1,
			pin: 1
		})
		if (!seller) {
			throw new CreateHttpError[404]('Seller Not Found')
		}
		const match = await password.compare(pin, seller.pin)

		if (match) {
			// remove seller pin before sending seller information to frontend
			const val = seller.toJSON()
			delete val.pin
			res.json(val)
		} else {
			throw new CreateHttpError[401]('Invalid Credentials')
		}
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
