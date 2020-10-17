export const paginationData = ({ limit, totalOrders, currentPage }) => {
	return {
		pages: Math.ceil(totalOrders / limit),
		perPage: limit,
		currentPage,
		totalOrders
	}
}

export const skipData = ({ page = 1, limit = 10 }) => ({
	skip: (page - 1) * limit,
	limit,
	page
})
