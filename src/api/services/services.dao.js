import CreateHttpError from 'http-errors'
import { winston } from '../../util'
import { Apartment } from '../../models'

export const findCities = async () => {
	try {
		const data = await Apartment.distinct('city').sort()
		return data
	} catch (error) {
		winston.debug('@error findCities', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findAreaByCity = async city => {
	try {
		const data = await Apartment.distinct('area', { city }).sort()
		return data
	} catch (error) {
		winston.debug('@error findAreaByCity', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const findApartmentsByCityAndArea = async (city, area) => {
	try {
		const data = await Apartment.find(
			{ city, area },
			{ name: 1, state: 1, pincode: 1 }
		)
			.limit(50)
			.sort({ name: 1 })
		return data
	} catch (error) {
		winston.debug('@error findApartmentsByCityAndArea', { error })
		return Promise.reject(new CreateHttpError[500]())
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
		winston.debug('@error findApartmentsByCityAndArea', { error })
		return Promise.reject(new CreateHttpError[500]())
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
		winston.debug('@error findApartmentsByLocation', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}
