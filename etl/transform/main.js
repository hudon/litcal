import process from "node:process"
import fs from "fs"

const baptismDates = {
	2025: new Date(2025, 0, 12),
	2026: new Date(2026, 0, 11),
}

function fatal(s) {
	console.error(s)
	process.exit(1)
}

/**
 * adds days to a given date
 * @param {Date} d - the original date
 * @param {number} days - the days to add
 * @return {Date}
 */
function addDays(d, days) {
	const inMS = days * 24 * 60 * 60 * 1000
	return new Date(d.getTime() + inMS)
}

/**
 * Returns the date of easter for a given year.
 *   The algorithm is based on the following website:
 *   https://en.wikipedia.org/wiki/Date_of_Easter#Anonymous_Gregorian_algorithm
 *   using the New Scientist correction.
 *   Also reference https://www.codeproject.com/Articles/10860/Calculating-Christian-Holidays when calculating holidays
 * @param year
 * @return {Date}
 */
function computeEasterGregorian(year) {
	const a = year % 19,
		b = Math.floor(year / 100),
		c = year % 100,
		d = Math.floor(b / 4),
		e = b % 4,
		g = Math.floor((8 * b + 13) / 25),
		h = (19 * a + b - d - g + 15) % 30,
		i = Math.floor(c / 4),
		k = c % 4,
		l = (32 + 2 * e + 2 * i - h - k) % 7,
		m = Math.floor((a + 11 * h + 19 * l) / 433),
		month = Math.floor((h + l - 7 * m + 90) / 25),
		day = (h + l - 7 * m + 33 * month + 19) % 32
	return new Date(year, month - 1, day)
}

/**
 * returns json with the \"LitCal\" key turned to 'events' if it exists, otherwise returns the json as-is
 * @param data
 * @return {import('./types').TransformedCal}
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
 * @param {import('./types').TransformedCal} data
 */
function addTopLevelSeasons(data) {
	// NOTE: we're assuming:
	// 1. The given file is all for the same secular year,
	// 2. The file has one 'BaptismLord' event, and the year of that event is the secular year of the whole file
	// 3. The file might contain events from the previous secular year but the same liturgical year
	const bev = data.events["BaptismLord"],
		baptismDate = new Date(bev.year, bev.month - 1, bev.day),
		nextBaptismDate = baptismDates[bev.year + 1],
		secularYear = bev.year

	if (!nextBaptismDate) {
		fatal(
			"ERROR: no baptism date for the next secular year. Updates baptismDates in the script and run again",
		)
	}

	function computeAdventStart(y) {
		const nativityDate = new Date(y, 11, 25),
			sundayBeforeChristmas = addDays(
				nativityDate,
				-(nativityDate.getDay() || 7),
			)
		return addDays(sundayBeforeChristmas, -3 * 7)
	}

	function makeLitYear(y) {
		return {
			startDate: computeAdventStart(y - 1),
			endDate: addDays(computeAdventStart(y), -1),
			secular: y,
		}
	}

	function makeLitYears() {
		return {
			[secularYear]: makeLitYear(secularYear),
			[secularYear + 1]: makeLitYear(secularYear + 1),
		}
	}

	function makeLitSeasons() {
		const christmasStart = new Date(secularYear - 1, 11, 25),
			easterDate = computeEasterGregorian(secularYear),
			nextSecular = secularYear + 1,
			nextAdventStart = computeAdventStart(secularYear),
			nextChristmas = new Date(secularYear, 11, 25),
			arrToSeasons = (arr) =>
				arr.map((seasonData) => ({
					name: seasonData[0],
					color: seasonData[1],
					startDate: seasonData[2],
					endDate: seasonData[3],
				}))
		return {
			[secularYear]: arrToSeasons([
				["Christmas", "white", christmasStart, baptismDate],
				[
					"Ordinary Time",
					"green",
					addDays(baptismDate, 1),
					addDays(easterDate, -47),
				],
				["Lent", "violet", addDays(easterDate, -46), addDays(easterDate, -4)],
				[
					"Paschal Triduum",
					"red",
					addDays(easterDate, -3),
					addDays(easterDate, -1),
				],
				["Easter", "white", easterDate, addDays(easterDate, 49)],
				[
					"Ordinary Time",
					"green",
					addDays(easterDate, 50),
					addDays(nextAdventStart, -1),
				],
			]),
			[nextSecular]: arrToSeasons([
				["Advent", "violet", nextAdventStart, addDays(nextChristmas, -1)],
				["Christmas", "white", nextChristmas, nextBaptismDate],
			]),
		}
	}

	data["litYears"] = makeLitYears()
	data["litSeasons"] = makeLitSeasons()
	// TODO here
}

/**
 *
 * @param {import('./types').TransformedCal}data
 */
function addURLs(data) {
	const pad = (n) => ("0" + n).slice(-2)
	Object.entries(data.events).forEach(([evKey, ev]) => {
		const base = "http://bible.usccb.org/bible/readings/"
		if (!("readingsURL" in ev))
			ev["readingsURL"] =
				base + pad(ev.month) + pad(ev.day) + pad(ev.year) + ".cfm"
	})
}

/**
 *
 * @param {import('./types').TransformedCal} data
 */
function addGospels(data) {}

/**
 *
 * @param {import('./types').InputCal} data
 * @return {import('./types').TransformedCal}
 */
function transform(data) {
	// Because some transforms depend on data from previous ones, order generally matters
	data = eventify(data)
	addTopLevelSeasons(data)
	addURLs(data) // TODO: double check manually that this works. Stopped here on 2024-04-29 bc USCCB hasn't uploaded readings for 2025 yet
	addGospels(data)
	return data
}

export default function () {
	if (process.argv.length < 3) {
		fatal("ERROR: not enough arguments. Provide JSON filepath")
	}
	let filename = process.argv[2]
	const data = JSON.parse(fs.readFileSync(filename, "utf8"))
	const nextData = transform(data)
	const nextStr = JSON.stringify(nextData, null, 2)
	fs.writeFileSync(`${filename}.transformed.json`, nextStr)
}
