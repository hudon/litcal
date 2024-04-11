//
//  LitCalendarViewModelTests.swift
//  litcal-darwinTests
//
//  Created by James Hudon on 9/6/22.
//

import XCTest

final class LitCalendarViewModelTests: XCTestCase {
	var litViewModel: LitCalendarViewModel!

	override func setUpWithError() throws {
		let bundle = Bundle(for: type(of: self ))
		litViewModel = try LitCalendarViewModel(bundle: bundle, dbName: "test")
	}

	func testWrongDB() throws {
		XCTAssertThrowsError(
			try LitCalendarViewModel(bundle: .main, dbName: "foo bar")
		) { err in
			XCTAssert(err is LitcalModelError)
		}
	}

	func testDatesAreAtMidnightBoundary() throws {
		let secondsInDay = 60 * 60 * 24
		for dateSeconds in litViewModel.celebrations.keys {
			XCTAssertEqual(Int(dateSeconds) % secondsInDay,0)
		}
	}

	func testDatesAndCelebrations() throws {
		// TODO: test the validity of these properties
		XCTAssertEqual(
			litViewModel.datesInSeconds.count,
			litViewModel.celebrations.count
		)
		for dateSec in litViewModel.datesInSeconds {
			XCTAssertNotNil(
				litViewModel.celebrations[dateSec]
			)
		}
	}

	func testTodayIsToday() throws {
		let dateFormatter = DateFormatter()
		dateFormatter.dateStyle = .full
		let expectedDateStr = dateFormatter.string(from: Date.now)
		dateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
		let actualDateStr = dateFormatter.string(from: litViewModel.todayDate)
		// This should work because the format has no hours and seconds. If it did, they wouldn't be equal.
		XCTAssertEqual(actualDateStr, expectedDateStr)

	}
	
	func testTodaySecondsAreZero() throws {
		let dateComponents = Calendar.current.dateComponents(
			in: TimeZone(secondsFromGMT: 0)!,
			from: litViewModel.todayDate
		)
		XCTAssertEqual(dateComponents.hour, 0)
		XCTAssertEqual(dateComponents.minute, 0)
		XCTAssertEqual(dateComponents.second, 0)
		XCTAssertEqual(dateComponents.nanosecond, 0)
	}

	func testMin() throws {
		XCTAssertEqual(litViewModel.minDateSeconds, 1704067200)
	}
}
