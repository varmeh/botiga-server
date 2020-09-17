import CreateHttpError from 'http-errors'
import { winston } from '../../../util'
import { Seller } from '../../../models'

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

		return await seller.save().contact
	} catch (error) {
		winston.debug('@error dbFindSellerByNumber', { error })
		return Promise.reject(new CreateHttpError[500]())
	}
}
