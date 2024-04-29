import * as path from "node:path"
import fs from "fs"

function formatDate(date) {
	let year = date.getFullYear()
	let month = ("0" + (date.getMonth() + 1)).slice(-2) // Months are zero-based
	let day = ("0" + date.getDate()).slice(-2)
	let hours = ("0" + date.getHours()).slice(-2)
	let minutes = ("0" + date.getMinutes()).slice(-2)
	let seconds = ("0" + date.getSeconds()).slice(-2)

	return `${year}${month}${day}_${hours}${minutes}${seconds}`
}

/**
 *
 * @param {string} dbPath
 * @throws throws IO errors if it can't open/create/copy db files
 */
export default function backup(dbPath) {
	const ext = path.extname(dbPath),
		dbName = path.basename(dbPath, ext),
		timestamp = formatDate(new Date()),
		backupName = `${dbName}_${timestamp}${ext}`,
		backupPath = path.join(path.dirname(dbPath), backupName)

	fs.copyFileSync(dbPath, backupPath)

	console.log(`INFO: database backed up to ${backupPath}`)
}
