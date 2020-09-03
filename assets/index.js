import fs from 'fs'
import path from 'path'

export const templates = {
	auth: {
		signup: 'signup.html'
	}
}

export const getTemplate = templateName => {
	return fs.readFileSync(path.join(__dirname, templateName), 'utf-8')
}
