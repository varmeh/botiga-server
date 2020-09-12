import CreateHttpError from 'http-errors'
import brcrypt from 'bcrypt'

import { winston } from './winston.logger'

const saltRounds = 12

const hash = async pin => {
	try {
		return await brcrypt.hash(pin, saltRounds)
	} catch (error) {
		winston.debug('@error.pin hash', { msg: 'error during pin hash', error })
		return Promise.reject(new CreateHttpError[500]())
	}
}

const compare = async (pin, hashedPin) => {
	try {
		return await brcrypt.compare(pin, hashedPin)
	} catch (error) {
		winston.debug('@error.pin compare', {
			msg: 'error during pin compare',
			error
		})
		return Promise.reject(new CreateHttpError[500]())
	}
}

export default { hash, compare }
