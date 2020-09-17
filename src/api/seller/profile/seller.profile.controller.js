import CreateHttpError from 'http-errors'

import { token } from '../../../util'
import { updateContactInformation } from './seller.profile.dao'

export const patchContact = async (req, res, next) => {
	const {
		email,
		phone,
		whatsapp,
		building,
		street,
		city,
		area,
		state,
		pincode
	} = req.body

	try {
		const seller = await updateContactInformation(token.get(req), {
			email,
			phone,
			whatsapp,
			building,
			street,
			city,
			area,
			state,
			pincode
		})

		// Add jwt token
		token.set(res, seller._id)

		res.status(201).json({ id: seller._id })
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
