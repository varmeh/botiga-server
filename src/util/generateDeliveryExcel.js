import path from 'path'
import Excel from 'exceljs'
import { moment } from './date'

const formatWorksheet = worksheet => {
	const insideColumns = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

	//For Header Row
	insideColumns.forEach(v => {
		worksheet.getCell(`${v}1`).alignment = {
			vertical: 'middle',
			horizontal: 'center'
		}
		worksheet.getCell(`${v}1`).font = { size: 12 }
	})
	worksheet.views = [
		{ state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'B1' }
	]
}

const aptAbbrevation = apartmentName => {
	const arr = apartmentName.split(/\s+/)
	let newName = ''
	arr.forEach(word => {
		newName += word.charAt(0)
	})

	return newName
}

const generateSheetForApartment = ({ workbook, apartmentData }) => {
	const { apartment: { apartmentName } = {}, deliveries = [] } = apartmentData

	const worksheetName =
		apartmentName.length > 30 ? aptAbbrevation(apartmentName) : apartmentName

	const worksheet = workbook.addWorksheet(worksheetName)

	worksheet.columns = [
		{ header: 'Name', key: 'name' },
		{ header: 'House', key: 'house' },
		{ header: 'Contact', key: 'contact' },
		{ header: 'Amount', key: 'amount' },
		{ header: 'Order Number', key: 'orderNumber' },
		{ header: 'Order Status', key: 'orderedStatus' },
		{ header: 'Payment Status', key: 'paymentStatus' },
		{ header: 'Refund Status', key: 'refundStatus' },
		{ header: 'Order Date', key: 'orderDate' },
		{ header: 'Products', key: 'products' },
		{ header: 'Unit', key: 'unit' },
		{ header: 'Quantity', key: 'quantity' }
	]

	// Have to take this approach because ExcelJS doesn't have an autofit property.
	worksheet.columns.forEach(column => {
		column.width = column.header.length < 16 ? 16 : column.header.length + 16
	})

	deliveries.forEach(delivery => {
		const {
			buyer: { name, house = '', phone = '' },
			createdAt,
			order: { number, status, totalAmount, products = [] },
			payment,
			refund
		} = delivery

		products.forEach((product, index) => {
			const { name: productName, unitInfo, quantity } = product
			if (index === 0) {
				worksheet.addRow({
					name,
					house,
					contact: phone,
					orderNumber: number,
					products: productName,
					unit: unitInfo,
					quantity: quantity,
					orderedStatus: status,
					amount: totalAmount,
					paymentStatus: payment.status,
					refundStatus: refund.status,
					orderDate: moment(createdAt).format('MMM Do, hh:mm a')
				})
			} else {
				worksheet.addRow({
					products: productName,
					unit: unitInfo,
					quantity: quantity
				})
			}
		})
		// Empty row between 2 product rows
		worksheet.addRow({})
	})

	formatWorksheet(worksheet)
}

export const generateExcel = async ({ deliveryData, fileName }) => {
	const filePath = path.join(__dirname, fileName)

	const workbook = new Excel.Workbook()
	workbook.creator = 'Botiga'
	workbook.created = new Date()
	workbook.properties.date1904 = true

	deliveryData.forEach(apartmentData =>
		generateSheetForApartment({
			workbook,
			apartmentData,
			filePath
		})
	)
	await workbook.xlsx.writeFile(filePath)

	return filePath
}
