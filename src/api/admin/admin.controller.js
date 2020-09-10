import CreateHttpError from 'http-errors'
import { dbCreateApartment } from './admin.dao'

export const postApartment = async (req, res, next) => {
	try {
		const areas = await dbCreateApartment(req.body)
		res.json(areas)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
