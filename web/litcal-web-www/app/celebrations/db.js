import Database from "better-sqlite3"
import path from "path"

const databasePath = path.resolve("../../litcal.sqlite")
const calID = 1

const celebrationQuerySELECT =
	"SELECT lc.event_key as eventKey, lc.rank, lc.title, lc.subtitle, lc.gospel, " +
	"lc.gospel_ref as gospelRef, lc.readings_url as readingsURL, lcol.name AS color, ls.name as season, " +
	"ld.secular_date_s as dateSeconds, lscol.name AS seasonColor "
const celebrationQueryFROM =
	"FROM lit_celebration lc " +
	"JOIN lit_day ld ON lc.lit_day_id = ld.id " +
	"JOIN lit_color lcol ON lc.lit_color_id = lcol.id " +
	"JOIN lit_season ls ON ld.lit_season_id = ls.id " +
	"JOIN lit_year ly ON ls.lit_year_id = ly.id " +
	"JOIN lit_color lscol ON ls.lit_color_id = lscol.id "

/**
 * Get the Liturgical celebration for today
 *
 * @param {number} utcDateMillis - the date to get the celebration for
 * @return {LitCelebration}
 */
export function fetchTodayCelebration(utcDateMillis) {
	const todayInEpochSeconds = utcDateMillis / 1000
	const db = new Database(databasePath)
	const queryStr =
		celebrationQuerySELECT +
		celebrationQueryFROM +
		"WHERE ld.secular_date_s = ? AND ly.lit_calendar_id = ? "
	return db.prepare(queryStr).get(todayInEpochSeconds, calID)
}

/**
 * Get all the LitCelebrations in between {@link from} and {@link to} inclusively.
 * Sorted in ascending chronological order.
 * @param {number} from - in milliseconds since epoch
 * @param {number} to - in milliseconds since epoch
 */
export function fetchCelebrations(from, to) {
	const db = new Database(databasePath)
	const queryStr =
		celebrationQuerySELECT +
		celebrationQueryFROM +
		"WHERE ld.secular_date_s >= ? AND ld.secular_date_s <= ? AND ly.lit_calendar_id = ? " +
		"ORDER BY ld.secular_date_s;"
	return db.prepare(queryStr).all(from / 1000, to / 1000, calID)
}
