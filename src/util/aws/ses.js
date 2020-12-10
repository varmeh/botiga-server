import nodemailer from 'nodemailer'
import { winston } from '../winston.logger'

import aws from './aws.config'

// create Nodemailer SES transporter
const transporter = nodemailer.createTransport({
	SES: new aws.SES({
		apiVersion: '2010-12-01'
	})
})

export default {
	sendMail: ({ from, to, subject, text, filename, path }) => {
		const attachments = []
		if (filename && path) {
			attachments.push({
				filename,
				path
			})
		}
		transporter.sendMail(
			{
				from,
				to,
				subject,
				html: text,
				priority: 'normal',
				attachments
			},
			(err, info) => {
				if (err) {
					winston.error('@ses failure', { to, subject, err })
				}
				winston.info('@ses successful', {
					to,
					subject,
					sesMessageId: info.messageId,
					response: info.response
				})
			}
		)
	}
}
