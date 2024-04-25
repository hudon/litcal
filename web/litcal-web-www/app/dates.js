/**
 * Returns true if local date and UTC date represent the same date.
 * Let's say you have a date like 2024-04-17T00:00:00 -7
 * and 2024-04-17T00:00:00 UTC. They both represent the same date, even though
 * the second date is the 16th in the -7 timezone offset
 *
 * @param {Date} date - a date interpreted in local timezone
 * @param {number} ms - a date interpreted in UTC
 * @return {boolean}
 */
export function isDateEqualToEpochMillis(date, ms) {
	if (!date || !ms) return false
	const e = new Date(ms)
	return (
		date.getFullYear() === e.getUTCFullYear() &&
		date.getMonth() === e.getUTCMonth() &&
		date.getDate() === e.getUTCDate()
	)
}

/**
 * Takes a date and returns the number of milliseconds from epoch to midnight (00:00 UTC) of the same day
 * @param {Date} d
 * @return {number}
 */
export function localDateToEpochMillis(d) {
	return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * Returns today as the number of milliseconds from epoch to 00:00 UTC of this calendar day
 * @return {number}
 */
export function todayAsEpochMillis() {
	return localDateToEpochMillis(new Date())
}

/**
 * prepend 0s to fit 2 chars
 * @param {string} s
 * @return {string}
 */
function leftPad(s) {
	return s.padStart(2, "0")
}

/**
 * Make a URL segment out of date with the format 20240422
 *
 * @param {Date} [date]
 * @return {string}
 */
export function makeDateSegment(date) {
	if (!date) return ""
	const y = date.getFullYear().toString()
	const m = (date.getMonth() + 1).toString()
	const d = date.getDate().toString()
	return `${y}${leftPad(m)}${leftPad(d)}`
}

/**
 * Parses a date string of format 20240422 and returns milliseconds since epoch
 * up to midnight UTC at that date
 *
 * @param {string} dateStr - The date string to be parsed.
 * @return {number} - The Date in milliseconds since epoch
 * @throws {Error} - If the string does not represent a valid date
 */
export function parseDateSegment(dateStr) {
	const errMsg = "Invalid date format."
	if (!dateStr) throw new Error(errMsg)
	let y = parseInt(dateStr.substring(0, 4))
	let m = parseInt(dateStr.substring(4, 6)) - 1
	let d = parseInt(dateStr.substring(6, 8))
	if (!y || isNaN(m) || !d) {
		// TODO: present error well
		throw new Error("Invalid date format")
	}
	return Date.UTC(y, m, d)
}
