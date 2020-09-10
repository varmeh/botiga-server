import CreateHttpError, { BadRequest } from 'http-errors'
import {
	dbFindCities,
	dbFindAreasByCity,
	dbFindApartmentsByCityAndArea,
	dbFindApartmentsByLocation
} from './services.dao'

export const getApartmentsByLocation = async (req, res, next) => {
	const { lat, long } = req.query
	if (!lat || !long) {
		throw new BadRequest('Missing Query Params - lat, long')
	}
	try {
		const data = await dbFindApartmentsByLocation(lat, long)
		res.json(data)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

// Returns the list of cities with Botiga Presence
export const getCities = async (_, res, next) => {
	try {
		const cities = await dbFindCities()
		res.json(cities)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getAreasForCity = async (req, res, next) => {
	try {
		const areas = await dbFindAreasByCity(req.params.city)
		res.json(areas)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getApartmentsByCityAndArea = async (req, res, next) => {
	const { city, area } = req.query
	if (!city || !area) {
		throw new BadRequest('Missing Query Params - city or area')
	}
	try {
		const areas = await dbFindApartmentsByCityAndArea(city, area)
		res.json(areas)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
