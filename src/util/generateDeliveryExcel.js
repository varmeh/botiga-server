import Excel from 'exceljs'
import { moment } from './date'

const formatExcel = worksheet => {
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

const generateExceForApartment = ({
	workbook,
	apartmentData,
	phone,
	date,
	isOneExcel
}) => {
	const { apartment: { apartmentName } = {}, deliveries = [] } = apartmentData

	let newWorkbook
	if (isOneExcel) {
		newWorkbook = workbook
	} else {
		newWorkbook = new Excel.Workbook()
	}

	const worksheetName =
		apartmentName.length > 30 ? aptAbbrevation(apartmentName) : apartmentName
	const worksheet = newWorkbook.addWorksheet(worksheetName)

	worksheet.columns = [
		{ header: 'Name', key: 'name' },
		{ header: 'House', key: 'house' },
		{ header: 'Contact', key: 'contact' },
		{ header: 'Products', key: 'products' },
		{ header: 'Unit', key: 'unit' },
		{ header: 'Quantity', key: 'quantity' },
		{ header: 'Ordered At', key: 'orderedAt' }
	]

	// Have to take this approach because ExcelJS doesn't have an autofit property.
	worksheet.columns.forEach(column => {
		column.width = column.header.length < 16 ? 16 : column.header.length + 16
	})

	deliveries.forEach(delivery => {
		const {
			buyer: { name, house = '', phone = '' },
			createdAt,
			order: { products = [] }
		} = delivery

		products.forEach((product, index) => {
			const { name: productName, unitInfo, quantity } = product
			if (index === 0) {
				worksheet.addRow({
					name,
					house,
					contact: phone,
					products: productName,
					unit: unitInfo,
					quantity: quantity,
					orderedAt: moment(createdAt).format('MMM Do, hh:mm a')
				})
			} else {
				worksheet.addRow({
					products: productName,
					unit: unitInfo,
					quantity: quantity
				})
			}
		})
		worksheet.addRow({})
	})

	formatExcel(worksheet)

	if (isOneExcel) {
		//For Accumulated
		newWorkbook.xlsx.writeFile(`${phone}_${date}.xlsx`)
	} else {
		//Replace with deliveryDate
		newWorkbook.xlsx.writeFile(`${aptAbbrevation(apartmentName)}_${date}.xlsx`)
	}
}

export const generateExcel = ({
	deliveryData,
	phone,
	date,
	isOneExcel = true
}) => {
	const workbook = new Excel.Workbook()
	deliveryData.forEach(apartmentData =>
		generateExceForApartment({
			workbook,
			phone,
			apartmentData,
			isOneExcel,
			date
		})
	)
}
