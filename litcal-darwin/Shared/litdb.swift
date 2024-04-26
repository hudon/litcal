//
//  litdb.swift
//  litcal-darwin
//
//  Created by James Hudon on 4/8/24.
//

import Foundation
import SQLite3

struct LitDB {
	static let calID: Int32 = 1
}

enum LitError: Error {
	case unknown
	case error(message: String)

	init() {
		self = .unknown
	}

}

enum LitColor: String {
	case white, red, violet, green, rose
}

struct LitCelebration {
	let color: LitColor
	let eventKey: String
	let title: String
	let subtitle: String
	let gospelRef: String
	let readingsUrl: String
	let gospelText: String
	let rank: Int
	let epochSeconds: Int64
	let season: String
}

func openDB(_ filename: String, _ ppDB: UnsafeMutablePointer<OpaquePointer?>!) throws {
	if sqlite3_open(filename, ppDB) != SQLITE_OK {
		sqlite3_close(ppDB.pointee)
		let msg = String(cString: sqlite3_errmsg(ppDB.pointee))
		throw LitError.error(message: "can't open database: " + msg)
	}
}

func litGetMinAndMax(_ db: OpaquePointer, _ calID: Int) throws -> (Int64, Int64)  {
	let queryStr =
		"SELECT MIN(ld.secular_date_s), MAX(ld.secular_date_s) " +
		"FROM lit_day ld, lit_season ls, lit_year ly, lit_calendar lc " +
	       "WHERE ld.lit_season_id = ls.id " +
	       "AND ls.lit_year_id = ly.id " +
	       "AND ly.lit_calendar_id = ?;"

	var stmt: OpaquePointer?
	var rc = sqlite3_prepare_v2(db, queryStr, -1, &stmt, nil);
	if (rc != SQLITE_OK) {
		let msg = String(cString: sqlite3_errmsg(db))
		throw LitError.error(message: "Failed to prepare statement: \(msg)")
	}
	defer {
		sqlite3_finalize(stmt)
	}
	rc = sqlite3_bind_int64(stmt, 1, Int64(calID));
	if (rc != SQLITE_OK) {
		let msg = String(cString: sqlite3_errmsg(db))
		throw LitError.error(message: "Failed to bind parameter: \(msg)")
	}

	rc = sqlite3_step(stmt);
	if (rc != SQLITE_ROW) {
		let msg = String(cString: sqlite3_errmsg(db))
		throw LitError.error(message: "Failed to step: \(msg)")
	}
	return (
		sqlite3_column_int64(stmt, 0),
		sqlite3_column_int64(stmt, 1)
	)
}

func litCelebrationsInRange(
	_ db: OpaquePointer,
	_ calID: Int,
	_ lo: Int64,
	_ hi: Int64, 
	processRow: (LitCelebration) -> Void
) throws {
	if (lo < 0 || hi < 0) {
		throw LitError.error(message: "invalid args: lo, hi")
	}

	let query =
		"SELECT lc.event_key, lc.rank, lc.title, lc.subtitle, lc.gospel, " +
		"lc.gospel_ref, lc.readings_url, lcol.name AS color, ls.name, " +
		"ld.secular_date_s, COUNT(*) OVER () " +
		"FROM lit_celebration lc " +
		"JOIN lit_day ld ON lc.lit_day_id = ld.id " +
		"JOIN lit_color lcol ON lc.lit_color_id = lcol.id " +
		"JOIN lit_season ls ON ld.lit_season_id = ls.id " +
		"JOIN lit_year ly ON ls.lit_year_id = ly.id " +
		"WHERE ld.secular_date_s >= ? AND ld.secular_date_s <= ? AND ly.lit_calendar_id = ? " +
		"ORDER BY ld.secular_date_s;"

	var stmt: OpaquePointer?
	var rc = sqlite3_prepare_v2(db, query, -1, &stmt, nil);
	if (rc != SQLITE_OK) {
		let msg = String(cString: sqlite3_errmsg(db))
		throw LitError.error(message: "Failed to prepare statement: \(msg)")
	}
	defer {
		sqlite3_finalize(stmt);
	}

	rc = sqlite3_bind_int64(stmt, 1, lo);
	if (rc != SQLITE_OK) {
		let msg = String(cString: sqlite3_errmsg(db))
		throw LitError.error(message: "Failed to bind parameter lo: \(msg)")
	}

	rc = sqlite3_bind_int64(stmt, 2, hi);
	if (rc != SQLITE_OK) {
		let msg = String(cString: sqlite3_errmsg(db))
		throw LitError.error(message: "Failed to bind parameter hi: \(msg)")
	}

	rc = sqlite3_bind_int64(stmt, 3, Int64(calID));
	if (rc != SQLITE_OK) {
		let msg = String(cString: sqlite3_errmsg(db))
		throw LitError.error(message: "Failed to bind parameter calID: \(msg)")
	}

	rc = sqlite3_step(stmt);
	while (rc == SQLITE_ROW) {

		var subtitle = ""
		if let subtitlePtr = sqlite3_column_text(stmt, 3) {
			 subtitle = String(cString: subtitlePtr)
		}

		let cel = LitCelebration(
			color: LitColor(
				rawValue: String(cString: sqlite3_column_text(stmt, 7))
			)!,
			eventKey: String(cString: sqlite3_column_text(stmt, 0)),
			title: String(cString: sqlite3_column_text(stmt, 2)),
			subtitle: subtitle,
			gospelRef: String(cString: sqlite3_column_text(stmt, 5)),
			readingsUrl: String(cString: sqlite3_column_text(stmt, 6)),
			gospelText: String(cString: sqlite3_column_text(stmt, 4)),
			rank: Int(sqlite3_column_int(stmt, 1)),
			epochSeconds: Int64(sqlite3_column_int64(stmt, 9)),
			season: String(cString: sqlite3_column_text(stmt, 8))
		)

		processRow(cel)

		rc = sqlite3_step(stmt);
	}

	if (rc != SQLITE_DONE) {
		let msg = String(cString: sqlite3_errmsg(db))
		throw LitError.error(message: "Failed to step: \(msg)")
       }
}
