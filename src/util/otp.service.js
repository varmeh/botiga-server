import axios from 'axios'
import { winston } from './winston.logger'

const { OTP_API_KEY } = process.env
const baseUrl = `https://2factor.in/API/V1/${OTP_API_KEY}/SMS`

const send = async (phone, template) => {
	try {
		const { data } = await axios.get(`${baseUrl}/${phone}/AUTOGEN/${template}`)
		return data.Details
	} catch (error) {
		winston.debug('@otp send failed', { error })
		return Promise.reject(new Error(error.data.Details))
	}
}

const verify = async (sessionId, otp) => {
	try {
		const data = await axios.get(`${baseUrl}/VERIFY/${sessionId}/${otp}`)
		return data
	} catch (error) {
		// console.error(error.data)
		winston.debug('@otp verify failed', { error })
		return Promise.reject(new Error(error.data.Details))
	}
}

export default { send, verify }
