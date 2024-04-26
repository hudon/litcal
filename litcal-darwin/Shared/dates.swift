//
//  utils.swift
//  litcal-darwin
//
//  Created by James Hudon on 8/4/22.
//

import SwiftUI

let kSecondsPerDay: Int64 = 60 * 60 * 24

/// Create a date from specified parameters
///
/// - Parameters:
///   - year: The desired year
///   - month: The desired month
///   - day: The desired day
/// - Returns: A `Date` object
func dateFromComponents(year: Int, month: Int, day: Int) -> Date? {
	if year < 0 || month < 0 || day < 0 {
		return nil
	}
	let calendar = Calendar(identifier: .gregorian)
	var dateComponents = DateComponents()
	dateComponents.year = year
	dateComponents.month = month
	dateComponents.day = day
	dateComponents.timeZone = TimeZone(identifier: "GMT")
	return calendar.date(from: dateComponents) ?? nil
}

func makeGMTFormatter(_ dateFormat: String) -> DateFormatter {
	let f = DateFormatter()
	f.dateFormat = dateFormat
	f.timeZone = TimeZone(identifier: "GMT")
	return f
}


/// Computes the current date (no time) and returns it
/// - Returns: the current date as number of seconds from epoch
///  to 00:00 UTC of the current date
func todayAsEpochSeconds() -> Int64 {
	let calendar = Calendar(identifier: .gregorian)
	let now = calendar.dateComponents([.year, .month, .day], from: Date())
	var dateComponents = DateComponents()
	dateComponents.year = now.year
	dateComponents.month = now.month
	dateComponents.day = now.day
	dateComponents.timeZone = TimeZone(identifier: "GMT")
	return Int64(calendar.date(from: dateComponents)!.timeIntervalSince1970)
}
