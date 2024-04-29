import process from "node:process"
import fs from "fs"

function fatal(s) {
	console.error(s)
	process.exit(1)
}

function transform(data, nextBaptismDate) {
	return data
}

export default function () {
	if (process.argv.length < 4) {
		fatal(
			"ERROR: not enough arguments. Provide JSON file and the date of the Baptism from the following liturgical year (eg. 2026-01-12)",
		)
	}
	let filename = process.argv[2]
	const data = JSON.parse(fs.readFileSync(filename, "utf8"))
	const nextBaptismDate = new Date(process.argv[3])
	if (isNaN(nextBaptismDate.getTime())) {
		fatal("ERROR: date is invalid")
	}
	const nextData = transform(data, nextBaptismDate)
	const nextStr = JSON.stringify(nextData, null, 2)
	fs.writeFileSync(`${filename}.transformed.json`, nextStr)
}
