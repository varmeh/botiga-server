import CreateHttpError from 'http-errors'
import { nanoid } from 'nanoid'
import { token, aws, controllerErroHandler } from '../../util'
import { findHelperData, Seller } from '../../models'
import {
	findApartment,
	findCities,
	findAreaByCity,
	findApartmentsByLocation,
	findApartmentsSearch
} from './services.dao'

const extractApartmentInfo = apartment => {
	const { _id, name, area, city, state, pincode } = apartment
	return { _id, name, area, city, state, pincode }
}

export const getApartmentById = async (req, res, next) => {
	try {
		const apartment = await findApartment(req.params.apartmentId)
		res.json(extractApartmentInfo(apartment))
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getApartmentsByLocation = async (req, res, next) => {
	const { lat, long } = req.query
	if (!lat || !long) {
		throw new CreateHttpError[400]('Missing Query Params - lat, long')
	}
	try {
		const data = await findApartmentsByLocation(lat, long)
		res.json(data)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

// Returns the list of cities with Botiga Presence
export const getCities = async (_, res, next) => {
	try {
		const cities = await findCities()
		res.json(cities)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getAreasForCity = async (req, res, next) => {
	try {
		const areas = await findAreaByCity(req.params.city)
		res.json(areas)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getApartmentsSearch = async (req, res, next) => {
	try {
		const apartments = await findApartmentsSearch(req.query.text)
		res.json(apartments)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getBusinessCategory = async (_, res, next) => {
	try {
		const { businessCategory } = await findHelperData()
		res.json(businessCategory)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getSellerFilters = async (_, res, next) => {
	try {
		const { sellerFilters } = await findHelperData()
		res.json(sellerFilters)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getImageUrl = async (req, res, next) => {
	try {
		const { imageType } = req.params
		const fileName = `${token.get(req)}_${nanoid(6)}.${imageType}`
		const data = await aws.s3.getPredefinedImageUrl(fileName, imageType)
		res.status(201).json(data)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getBrandImageUrl = async (req, res, next) => {
	try {
		const { imageType } = req.params
		const fileName = `${nanoid()}.${imageType}`
		const data = await aws.s3.getPredefinedImageUrl(fileName, imageType)
		res.status(201).json(data)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const getPdfUrl = async (_, res, next) => {
	try {
		const fileName = `${nanoid()}.pdf`
		const data = await aws.s3.getPredefinedPdfUrl(fileName)
		res.status(201).json(data)
	} catch (error) {
		controllerErroHandler(error, next)
	}
}

export const postImageDelete = async (req, res, next) => {
	try {
		// First validate seller exists as only seller could delete image
		const seller = await Seller.findById(token.get(req))

		if (!seller) {
			throw new CreateHttpError[404]('Seller Not Found')
		}

		await aws.s3.deleteImageUrl(req.body.imageUrl)
		res.status(204).json()
	} catch (error) {
		controllerErroHandler(error, next)
	}
}
