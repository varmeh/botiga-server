import {
	adminRouter,
	aiRouter,
	sellerRouter,
	servicesRouter,
	userRouter
} from './api'

/* Remember order matters when registering routes */
export default app => {
	const baseUrl = '/api'

	app.use(`${baseUrl}/admin`, adminRouter)
	app.use(`${baseUrl}/seller`, sellerRouter)
	app.use(`${baseUrl}/services`, servicesRouter)
	app.use(`${baseUrl}/user`, userRouter)
	app.use(`${baseUrl}/ai`, aiRouter)

	app.get(`${baseUrl}/live`, (_req, res) => {
		res.json({ message: 'server live' })
	})
}
