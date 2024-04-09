//
//  LitCalendarViewModel.swift
//  litcal-darwin
//
//  Created by James Hudon on 9/6/22.
//

import Foundation

private let secondsInADay = 86400.0

enum LitcalModelError: Error {
	case databaseError(String)
}

class LitCalendarViewModel: ObservableObject {
	private var db: OpaquePointer?
	var celebrations: [Int64: LitCelebrationBridge] = [:]
	var datesInSeconds: [Int64] = []
	// Fires to make sure "today" tracks the new day if it goes over the midnight boundary
	// TODO: however, if a view grabs the value at todaySeconds, nothing is in place to trigger a
	// re-render of the view when todaySeconds updates. Does it need a @Published?
	var todayTimer: Timer?
	var todaySeconds: Int64
	var minDateSeconds: Int64 = 0

	var todayDate: Date {
		Date(timeIntervalSince1970: TimeInterval(todaySeconds))
	}

	var todayCelebration: LitCelebrationBridge {
		celebrations[todaySeconds]!
	}

	init(bundle: Bundle = .main, includeMoreYears: Bool = true) throws {
		guard let fileURL = Bundle.main.url(forResource: "litcal", withExtension: "sqlite") else {
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
			let cel = LitCelebrationBridge(array[i])
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
		// TODO: cleanup DB?
		self.todayTimer?.invalidate()
	}
}


