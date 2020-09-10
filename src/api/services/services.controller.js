import CreateHttpError, { BadRequest } from 'http-errors'
import { dbGetCities, dbGetAreasForCity } from './services.dao'

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

// Returns the list of cities with Botiga Presence
export const getCities = async (_, res, next) => {
	try {
		const cities = await dbGetCities()
		res.json(cities)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getAreasForCity = async (req, res, next) => {
	try {
		const areas = await dbGetAreasForCity(req.params.city)
		res.json(areas)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
