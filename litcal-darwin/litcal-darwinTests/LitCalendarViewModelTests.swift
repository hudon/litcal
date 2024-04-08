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
        litViewModel = try LitCalendarViewModel(bundle: bundle)
    }

//    func testDatesAreAtMidnightBoundary() throws {
//        let secondsInDay = 60 * 60 * 24
//        for date in litViewModel.dates {
//            XCTAssertEqual(date.timeIntervalSince1970.truncatingRemainder(dividingBy: TimeInterval(secondsInDay)), 0)
//        }
//    }
//
//    func testTodayIsToday() throws {
//        let dateFormatter = DateFormatter()
//        dateFormatter.dateStyle = .full
//        var expectedDateStr = dateFormatter.string(from: Date.now)
//        dateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
//        var actualDateStr = dateFormatter.string(from: litViewModel.todayDate)
//        // This should work because the format has no hours and seconds. If it did, they wouldn't be equal.
//        XCTAssertEqual(actualDateStr, expectedDateStr)
//
//        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZZZZZ"
//        // Make sure it still works at time boundary 23:59
//        litViewModel.todayDate = dateFormatter.date(from: "2022-10-11T23:59:59-07:00")!
//        actualDateStr = dateFormatter.string(from: litViewModel.todayDate)
//        expectedDateStr = "2022-10-11T00:00:00Z"
//        XCTAssertEqual(actualDateStr, expectedDateStr)
//        // Make sure it still works at time boundary 00:00
//        litViewModel.todayDate = dateFormatter.date(from: "2022-10-11T00:00:00-07:00")!
//        actualDateStr = dateFormatter.string(from: litViewModel.todayDate)
//        expectedDateStr = "2022-10-11T00:00:00Z"
//        XCTAssertEqual(actualDateStr, expectedDateStr)
//    }
//
//    func testTodaySecondsAreZero() throws {
//        let dateComponents = Calendar.current.dateComponents(in: TimeZone(secondsFromGMT: 0)!, from: litViewModel.todayDate)
//        XCTAssertEqual(dateComponents.hour, 0)
//        XCTAssertEqual(dateComponents.minute, 0)
//        XCTAssertEqual(dateComponents.second, 0)
//        XCTAssertEqual(dateComponents.nanosecond, 0)
//    }
}
