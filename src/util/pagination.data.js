export const paginationData = ({ limit, totalOrders, currentPage }) => {
	const pages = Math.ceil(totalOrders / limit)
	return {
		pages: pages === 0 ? 1 : pages,
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
