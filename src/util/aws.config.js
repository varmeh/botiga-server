import AWS from 'aws-sdk'

const { AWS_ACCESS_KEY, AWS_ACCESS_SECRET, AWS_REGION } = process.env

AWS.config.update({
	accessKeyId: AWS_ACCESS_KEY,
	secretAccessKey: AWS_ACCESS_SECRET,
	region: AWS_REGION
})

const s3 = new AWS.S3({ apiVersion: '2006-03-01' })

export default { s3 }
