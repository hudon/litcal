/**
 * Make a URL segment out of date with the format 20240422
 *
 * @param {Date} [date]
 * @return {string}
 */
export function makeDatePath(date) {
	return date ? date.toISOString().split("T")[0].replace(/-/g, "") : ""
}

/**
 * Creates a new Date object at UTC midnight of the given date
 *
 * @param {number} y - The year.
 * @param {number} m - The month (0-11).
 * @param {number} d - The day of the month (1-31).
 * @return {Date}
 */
export function newUTCDate(y, m, d) {
	return new Date(Date.UTC(y, m, d))
}

/**
 * Parses a date string of format 20240422 and returns a Date object.
 *
 * @param {string} dateStr - The date string to be parsed.
 * @return {Date} - The Date object representing the parsed date.
 * @throws {Error} - If the string does not represent a valid date
 */
export function parseDatePath(dateStr) {
	let y = parseInt(dateStr.substring(0, 4))
	let m = parseInt(dateStr.substring(4, 6)) - 1
	let d = parseInt(dateStr.substring(6, 8))
	if (!y || isNaN(m) || !d) {
		// TODO: present error well
		throw new Error("Invalid date format")
	}
	return new Date(y, m, d)
}
