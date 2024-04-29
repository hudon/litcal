import process from "node:process"
import fs from "fs"

function fatal(s) {
	console.error(s)
	process.exit(1)
}

/**
 * returns json with the \"LitCal\" key turned to 'events' if it exists, otherwise returns the json as-is
 * @param data
 * @return {{messages: [], events: {}}}
 */
function eventify(data) {
	if (data.hasOwnProperty("LitCal")) {
		return {
			events: data["LitCal"],
			messages: [],
		}
	}
	if (!data.hasOwnProperty("events")) {
		fatal(
			"ERROR: data in invalid format. Expected 'LitCal' or 'events' at top level",
		)
	}
	return data
}

/**
 *
 * @param {import('types').TransformedCal} data
 * @param nextBaptismDate
 */
function addTopLevelSeasons(data, nextBaptismDate) {
	function makeLitYears() {}
	function makeLitSeasons() {}
	data["litYears"] = makeLitYears()
	data["litSeasons"] = makeLitSeasons()
	// TODO here
}

/**
 *
 * @param {import('types').InputCal} data
 * @param nextBaptismDate
 * @return {import('types').TransformedCal}
 */
function transform(data, nextBaptismDate) {
	// Because some transforms depend on data from previous ones, order generally matters
	data = eventify(data)
	addTopLevelSeasons(data, nextBaptismDate)
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
