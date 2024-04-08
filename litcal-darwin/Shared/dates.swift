//
//  utils.swift
//  litcal-darwin
//
//  Created by James Hudon on 8/4/22.
//

import SwiftUI

/// Create a date from specified parameters
///
/// - Parameters:
///   - year: The desired year
///   - month: The desired month
///   - day: The desired day
/// - Returns: A `Date` object
func dateFromComponents(year: Int, month: Int, day: Int) -> Date? {
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
