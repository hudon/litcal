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
 * Returns true if local date and utc date represent the same date.
 * Let's say you have a date like 2024-04-17T00:00:00 -7
 * and 2024-04-17T00:00:00 UTC. They both represent the same date, even though
 * the second date is the 16th in the -7 timezone offset
 *
 * @param {Date} date - a date interpreted in local timezone
 * @param {Date} utcDate - a date interpreted in UTC
 * @return {boolean}
 */
export function isSameUTCDate(date, utcDate) {
	if (!date || !utcDate) return false
	return (
		date.getFullYear() === utcDate.getUTCFullYear() &&
		date.getMonth() === utcDate.getUTCMonth() &&
		date.getDate() === utcDate.getUTCDate()
	)
}

/**
 * Parses a date string of format 20240422 and returns milliseconds since epoch
 * up to midnight at that date
 *
 * @param {string} dateStr - The date string to be parsed.
 * @return {number} - The Date in milliseconds since epoch
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
	return Date.UTC(y, m, d)
}
