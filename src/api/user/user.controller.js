import CreateHttpError from 'http-errors'

import { findSellersInApartment } from './user.dao'

export const getSellersInApartment = async (req, res, next) => {
	const { apartmentId } = req.params

	try {
		const sellers = await findSellersInApartment({ apartmentId })

		res.json(sellers)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
