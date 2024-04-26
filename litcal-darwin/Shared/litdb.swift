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

	/// This will free the lit_error memory when done
	init(_ maybeErr: UnsafeMutablePointer<lit_error>?) {
		guard let err = maybeErr else {
			self = .unknown
			return
		}
		let msg = withUnsafeBytes(of: &err.pointee.message) { (rawPtr) -> String in
			let ptr = rawPtr.baseAddress!.assumingMemoryBound(to: CChar.self)
			return String(cString: ptr)
		}
		self = .error(message: msg)
		lit_error_free(err)
	}
}

func fixedCStrToString<T>( _ cstr: inout T) -> String {
	return withUnsafeBytes(of: &cstr) { (rawPtr) -> String in
		let ptr = rawPtr.baseAddress!.assumingMemoryBound(to: CChar.self)
		return String(cString: ptr)
	}
}

func fixedCStrToString<T, K>(_ root: T, _ keyPath: KeyPath<T, K>) -> String {
	var cstr = root[keyPath: keyPath]
	return fixedCStrToString(&cstr)
}

struct LitCelebration {
	let color: lit_color
	let eventKey: String
	let title: String
	let subtitle: String
	let gospelRef: String
	let readingsUrl: String
	let gospelText: String
	let rank: Int
	let epochSeconds: Int64
	let season: String

	init(_ cel: lit_celebration) {
		self.color = cel.color
		self.eventKey = fixedCStrToString(cel, \.event_key)
		self.title = fixedCStrToString(cel, \.title)
		self.subtitle = fixedCStrToString(cel, \.subtitle)
		self.gospelRef = fixedCStrToString(cel, \.gospel_ref)
		self.readingsUrl = String(cString: cel.readings_url)
		self.gospelText = String(cString: cel.gospel_text)
		self.rank = Int(cel.rank)
		self.epochSeconds = cel.epoch_seconds
		self.season = fixedCStrToString(cel, \.season)
	}
}

func openDB(_ filename: String, _ ppDB: UnsafeMutablePointer<OpaquePointer?>!) throws {
	if sqlite3_open(filename, ppDB) != SQLITE_OK {
		sqlite3_close(ppDB.pointee)
		let msg = String(cString: sqlite3_errmsg(ppDB.pointee))
		throw LitError.error(message: "can't open database: " + msg)
	}
}

func litGetMinAndMax(_ db: OpaquePointer?, _ calID: Int) throws -> (Int64, Int64)  {
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
