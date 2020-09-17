import CreateHttpError from 'http-errors'
import { winston } from '../../../util'
import { Apartment, Seller } from '../../../models'

export const findSeller = async sellerId => {
	try {
		return await Seller.findById(sellerId)
	} catch (error) {
		winston.debug('@error findSeller', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const updateContactInformation = async (
	sellerId,
	{ email, phone, whatsapp, building, street, city, area, state, pincode }
) => {
	try {
		const seller = await Seller.findById(sellerId)

		const { contact } = seller

		contact.email = !email ? contact.email : email
		contact.phone = !phone ? contact.phone : phone
		contact.whatsapp = !whatsapp ? contact.whatsapp : whatsapp

		const { address } = contact

		address.building = !building ? address.building : building
		address.street = !street ? address.street : street
		address.area = !area ? address.area : area
		address.city = !city ? address.city : city
		address.state = !state ? address.state : state
		address.pincode = !pincode ? address.pincode : pincode

		const updatedSeller = await seller.save()
		return updatedSeller.contact
	} catch (error) {
		winston.debug('@error updateContactInformation', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

export const updateBusinessInformation = async (
	sellerId,
	{ brandName, tagline, imageUrl }
) => {
	try {
		const seller = await Seller.findById(sellerId)

		const { brand } = seller

		brand.name = !brandName ? brand.name : brandName
		brand.tagline = !tagline ? brand.tagline : tagline
		brand.imageUrl = !imageUrl ? brand.imageUrl : imageUrl

		/* Brand info needs to be updated in all apartments serviced by seller */

		// Don't use map or forEach to avoid complication - https://zellwk.com/blog/async-await-in-loops/#:~:text=If%20you%20use%20await%20in,asynchronous%20functions%20always%20return%20promises.&text=Since%20map%20always%20return%20promises,do%20this%20with%20await%20Promise.
		for (let i = 0; i < seller.apartments.length; i++) {
			const apt = await Apartment.findById(seller.apartments[i]._id)
			const sellerInAptDoc = apt.sellers.id(sellerId)

			// update information
			sellerInAptDoc.brandName = brand.name
			sellerInAptDoc.tagline = brand.tagline
			sellerInAptDoc.brandImageUrl = brand.imageUrl

			await apt.save()
		}

		const updatedSeller = await seller.save()
		return updatedSeller.brand
	} catch (error) {
		winston.debug('@error updateBusinessInformation', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}
