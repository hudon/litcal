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

		self.todaySeconds = todayAsEpochSeconds()
		self.todayTimer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
			self.todaySeconds = todayAsEpochSeconds()
		}

		try openDB(fileURL.path, &db)

		var max: Int64 = 0
		(minDateSeconds, max) = try litGetMinAndMax(db!, Int(LitDB.calID))

		try litCelebrationsInRange(db!, Int(LitDB.calID), minDateSeconds, max) { cel in
			celebrations[cel.epochSeconds] = cel
			datesInSeconds.append(cel.epochSeconds)
		}
	}

	deinit {
		sqlite3_close(db)
		self.todayTimer?.invalidate()
	}
}


