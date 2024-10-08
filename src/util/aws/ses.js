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
		if (process.env.EMAIL_NOTIFICATONS_ENABLED === 'false') return

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
	},
	sendMailPromise: async ({
		from,
		to,
		subject,
		text,
		filename,
		path,
		cc,
		bcc
	}) => {
		if (process.env.EMAIL_NOTIFICATONS_ENABLED === 'false') return

		const attachments = []
		if (filename && path) {
			attachments.push({
				filename,
				path
			})
		}

		const payload = {
			from,
			to,
			subject,
			html: text,
			priority: 'normal',
			attachments
		}

		if (cc) {
			payload.cc = cc
		}

		if (bcc) {
			payload.bcc = bcc
		}

		try {
			await transporter.sendMail(payload)
		} catch (error) {
			winston.error('@ses failure', { to, subject, error })
		}
	}
}
