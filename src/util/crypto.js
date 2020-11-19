import CryptoJS from 'crypto-js'
import stringify from 'json-stringify-safe'

const { ENCRYPTION_SECRET } = process.env

const encryptString = text =>
	CryptoJS.AES.encrypt(text, ENCRYPTION_SECRET).toString()

const decryptString = encryptedString => {
	const bytes = CryptoJS.AES.decrypt(encryptedString, ENCRYPTION_SECRET)
	return bytes.toString(CryptoJS.enc.Utf8)
}

const encryptObject = object =>
	CryptoJS.AES.encrypt(stringify(object), ENCRYPTION_SECRET).toString()

const decryptObject = encryptedObject => {
	const bytes = CryptoJS.AES.decrypt(encryptedObject, ENCRYPTION_SECRET)
	return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}

export default { encryptString, decryptString, encryptObject, decryptObject }
