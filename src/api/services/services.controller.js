import { BadRequest } from 'http-errors'

export const getApartmentsByLocation = (req, res) => {
	const { lat, long } = req.query
	if (!lat || !long) {
		throw new BadRequest('Missing Query Params - lat, long')
	}
	res.json()
}

export const getApartmentsByCity = (req, res) => {
	const { city, area } = req.query
	if (!city || !area) {
		throw new BadRequest('Missing Query Params - city or area')
	}
	res.status(204).json()
}
