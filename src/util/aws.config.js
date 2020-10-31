import AWS from 'aws-sdk'
import CreateHttpError from 'http-errors'

import { winston } from './winston.logger'

const { AWS_ACCESS_KEY, AWS_ACCESS_SECRET, AWS_REGION } = process.env

AWS.config.update({
	accessKeyId: AWS_ACCESS_KEY,
	secretAccessKey: AWS_ACCESS_SECRET,
	region: AWS_REGION
})

const aws_s3 = new AWS.S3({ apiVersion: '2006-03-01' })

const awsPredefinedImageUrl = async (fileName, imageType) => {
	const { AWS_BUCKET_NAME, AWS_REGION } = process.env
	try {
		const data = await aws_s3.getSignedUrlPromise('putObject', {
			Bucket: AWS_BUCKET_NAME,
			Key: fileName,
			Expires: 10 * 60,
			ContentType: `image/${imageType}`,
			ACL: 'public-read'
		})

		return {
			uploadUrl: data,
			downloadUrl: `https://s3.${AWS_REGION}.amazonaws.com/${AWS_BUCKET_NAME}/${fileName}`
		}
	} catch (error) {
		winston.debug('@error awsPredefinedImageUrl', {
			error,
			msg: error.message
		})
		return Promise.reject(
			new CreateHttpError[500]('Unable to generate image url')
		)
	}
}

const s3 = {
	getPredefinedImageUrl: awsPredefinedImageUrl,
	deleteImageUrl: async imageUrl => {
		try {
			const arr = imageUrl.split('/')
			const data = await aws_s3.deleteObject({
				Bucket: process.env.AWS_BUCKET_NAME,
				Key: arr[arr.length - 1]
			})
			winston.debug('@aws delete image', { data })
		} catch (error) {
			winston.debug('@error deleteImageUrl', {
				error,
				msg: error.message
			})
			return Promise.reject(
				new CreateHttpError[500]('Unable to generate image url')
			)
		}
	}
}

export default { s3 }
