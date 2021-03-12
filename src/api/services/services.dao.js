import CreateHttpError from 'http-errors'
import { dbErrorHandler } from '../../util'
import { Apartment } from '../../models'

export const findApartment = async apartmenId => {
	try {
		const apartment = await Apartment.findById(apartmenId)
		if (!apartment) {
			return Promise.reject(new CreateHttpError[404]('Apartment not found'))
		}
		return apartment
	} catch (error) {
		return dbErrorHandler(error, 'findApartment')
	}
}

export const findCities = async () => {
	try {
		const data = await Apartment.distinct('city').sort()
		return data
	} catch (error) {
		return dbErrorHandler(error, 'findCities')
	}
}

export const findAreaByCity = async city => {
	try {
		const data = await Apartment.distinct('area', { city }).sort()
		return data
	} catch (error) {
		return dbErrorHandler(error, 'findAreaByCity')
	}
}

export const findApartmentsSearch = async (searchText = '') => {
	try {
		const data = await Apartment.find(
			{
				$or: [
					{ name: { $regex: searchText, $options: 'i' } },
					{ area: { $regex: searchText, $options: 'i' } },
					{ city: { $regex: searchText, $options: 'i' } },
					{ pincode: { $regex: searchText, $options: 'i' } }
				]
			},
			{ name: 1, area: 1, city: 1, pincode: 1, state: 1 }
		)
			.limit(50)
			.sort({ name: 1 })
		return data
	} catch (error) {
		return dbErrorHandler(error, 'findApartmentsByCityAndArea')
	}
}

export const findApartmentsByLocation = async (lat, long) => {
	try {
		// this query shows all apartments with-in 700 mtrs of point
		const data = await Apartment.find(
			{
				location: {
					$near: {
						$geometry: { type: 'Point', coordinates: [long, lat] },
						$maxDistance: 700
					}
				}
			},
			{ name: 1, state: 1, pincode: 1, city: 1, area: 1 }
		).sort({ name: 1 })
		return data
	} catch (error) {
		return dbErrorHandler(error, 'findApartmentsByLocation')
	}
}
