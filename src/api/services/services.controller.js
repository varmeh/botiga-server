import CreateHttpError from 'http-errors'
import { nanoid } from 'nanoid'
import { token, aws } from '../../util'
import {
	dbFindCities,
	dbFindAreasByCity,
	dbFindApartmentsByCityAndArea,
	dbFindApartmentsByLocation
} from './services.dao'

export const getApartmentsByLocation = async (req, res, next) => {
	const { lat, long } = req.query
	if (!lat || !long) {
		throw new CreateHttpError[400]('Missing Query Params - lat, long')
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
		throw new CreateHttpError[400]('Missing Query Params - city or area')
	}
	try {
		const areas = await dbFindApartmentsByCityAndArea(city, area)
		res.json(areas)
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}

export const getImageUrl = async (req, res, next) => {
	const { imageType } = req.params
	const fileName = `${token.get(req)}_${nanoid(6)}.${imageType}`
	const { AWS_BUCKET_NAME, AWS_REGION } = process.env
	try {
		const data = await aws.s3.getSignedUrlPromise('putObject', {
			Bucket: AWS_BUCKET_NAME,
			Key: fileName,
			Expires: 10 * 60,
			ContentType: `image/${imageType}`,
			ACL: 'public-read'
		})

		res.status(201).json({
			uploadUrl: data,
			downloadUrl: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileName}`
		})
	} catch (error) {
		const { status, message } = error
		next(new CreateHttpError(status, message))
	}
}
