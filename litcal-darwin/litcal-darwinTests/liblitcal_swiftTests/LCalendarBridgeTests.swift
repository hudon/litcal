//
//  LitCalendarBridgeTests.swift
//  litcal-darwinTests
//
//  Created by James Hudon on 8/18/22.
//

import XCTest

final class LCalendarBridgeTests: XCTestCase {
    func utcDateFromComponents(_ year: Int, _ month: Int, _ day: Int) -> Date {
        Calendar.current.date(from: DateComponents(timeZone: TimeZone(identifier: "UTC"), year: year, month: month, day: day))!
    }
//
//    func testConstructionEmptyFileName() throws {
//        XCTAssertThrowsError(try LCalendarBridge(fileName: "")) { error in
//            XCTAssertEqual(error as! LErrorBridge, LErrorBridge.fileOpenOrRead)
//        }
//    }
//
//    func testConstructionMissingFile() throws {
//        XCTAssertThrowsError(try LCalendarBridge(fileName: "doesn't exist")) { error in
//            XCTAssertEqual(error as! LErrorBridge, LErrorBridge.fileOpenOrRead)
//        }
//    }
//
//    func testConstructionHappy() throws {
//        let bundle = Bundle(for: type(of: self ))
//        XCTAssertNoThrow(try LCalendarBridge(fileName: bundle.path(forResource: "LCAPI-USA-2022-20221014-min", ofType: "json")!))
//    }
//
//    func testCalendarStartAndEnd() throws {
//        let bundle = Bundle(for: type(of: self ))
//        let fileName = bundle.path(forResource: "LCAPI-USA-2022-20221014-min", ofType: "json")!
//        let fileName23 = bundle.path(forResource: "LCAPI-USA-2023-with-2022events20221014-min", ofType: "json")!
//        let cal = try! LCalendarBridge(fileName: fileName)
//        try! cal.addData(fileName: fileName23)
//        XCTAssertEqual(cal.minYear!.startDateAsDate, utcDateFromComponents(2021, 11, 28))
//        XCTAssertEqual(cal.maxYear!.endDateAsDate, utcDateFromComponents(2024, 11, 30))
//    }
//
//    func testPerformance2022And2023() throws {
//        let bundle = Bundle(for: type(of: self ))
//        let fileName = bundle.path(forResource: "LCAPI-USA-2022-20221014-min", ofType: "json")!
//        let fileName23 = bundle.path(forResource: "LCAPI-USA-2023-with-2022events20221014-min", ofType: "json")!
//        // From profiling, currently most of the time (>70%) during LitCalendarBridge init is json parsing
//        measure {
//            let cal = try! LCalendarBridge(fileName: fileName)
//            _ = try! cal.addData(fileName: fileName23)
//        }
//    }
//
//    func testTitles() throws {
//        let bundle = Bundle(for: type(of: self ))
//        let litcal = try LCalendarBridge(fileName: bundle.path(forResource: "LCAPI-USA-2022-20221014-min", ofType: "json")!)
//        let litcel = try nonOptionalMassCelebration(litcal.getLitDay(year: 2022, month: 6, day: 13))
//        XCTAssertEqual(litcel.title, "Saint Anthony of Padua")
//        XCTAssertEqual(litcel.subtitle, "Priest and Doctor of the Church")
//    }

}
