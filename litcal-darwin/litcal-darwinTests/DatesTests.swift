//
//  datesTests.swift
//  litcal-darwinTests
//
//  Created by James Hudon on 4/11/24.
//

import XCTest

final class DatesTests : XCTestCase {
	func testDateFromComponents() {
		let d = dateFromComponents(
			year: 2024, month: 2, day: 1)
		XCTAssertEqual(
			d!.timeIntervalSince1970,
			1706745600.0)
	}

	func testDateFromComponentsInvalid() {
		let d = dateFromComponents(
			year: -1, month: 2, day: 1)
		XCTAssertNil(d)
	}
}
