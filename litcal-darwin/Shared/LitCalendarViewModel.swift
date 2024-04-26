//
//  LitCalendarViewModel.swift
//  litcal-darwin
//
//  Created by James Hudon on 9/6/22.
//

import Foundation
import SQLite3

private let secondsInADay = 86400.0

enum LitcalModelError: Error {
	case databaseError(String)
}

class LitCalendarViewModel: ObservableObject {
	private var db: OpaquePointer?
	private(set) var celebrations: [Int64: LitCelebration] = [:]
	private(set) var datesInSeconds: [Int64] = []
	// Fires to make sure "today" tracks the new day if it goes over the midnight boundary
	private var todayTimer: Timer?
	@Published var todaySeconds: Int64
	var minDateSeconds: Int64 = 0

	var todayDate: Date {
		Date(timeIntervalSince1970: TimeInterval(todaySeconds))
	}

	var todayCelebration: LitCelebration {
		celebrations[todaySeconds]!
	}

	init(bundle: Bundle = .main, dbName: String = "litcal") throws {
		guard let fileURL = bundle.url(forResource: dbName, withExtension: "sqlite") else {
			throw LitcalModelError.databaseError("Database file not found in bundle.")
		}

		var errPtr: UnsafeMutablePointer<lit_error>?
		if(!lit_open_db(fileURL.path, &self.db, &errPtr)) {
			throw LitError(errPtr)
		}

		var max: Int64 = 0
		if (!lit_get_min_and_max(
			self.db, LitDB.calID, &minDateSeconds, &max, &errPtr
		)) {
			throw LitError(errPtr)
		}

		var cels: UnsafeMutablePointer<lit_celebration>?
		var count: Int32 = 0
		if(!lit_celebrations_in_range(
			db, LitDB.calID,
			minDateSeconds, max,
			&cels, &count, &errPtr)
		) {
			throw LitError(errPtr)
		}
		let array = UnsafeBufferPointer(start: cels, count: Int(count))
		for i in 0..<Int(count) {
			let cel = LitCelebration(array[i])
			celebrations[cel.epochSeconds] = cel
			datesInSeconds.append(cel.epochSeconds)
		}
		lit_celebrations_free(cels, count)

		self.todaySeconds = Int64(lit_start_of_today_seconds())
		self.todayTimer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
			self.todaySeconds = Int64(lit_start_of_today_seconds())
		}
	}

	deinit {
		sqlite3_close(db)
		self.todayTimer?.invalidate()
	}
}


