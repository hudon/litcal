//
//  CalWheelCellView.swift
//  litcal-darwin
//
//  Created by James Hudon on 4/8/24.
//

import SwiftUI

private let weekdayFormatter = makeGMTFormatter("EEEEE")
private let dayOfMonthFormatter = makeGMTFormatter("d")

struct WheelColumnView: View {
	@EnvironmentObject var litViewModel: LitCalendarViewModel
	@Environment(\.colorScheme) private var colorScheme
	let celebration: LitCelebration
	var date: Date {
		Date(timeIntervalSince1970: TimeInterval(celebration.epochSeconds))
	}

	let isSelection: Bool

	var body: some View {
		VStack {
			weekdayTitleView(date)
			dayOfMonthView(date)
			Spacer()
		}
		.id(date.self)
		.frame(maxHeight: 60)
	}

	@ViewBuilder
	func weekdayTitleView(_ date: Date) -> some View {
		Text(weekdayFormatter.string(from: date))
			.litFont(size: 13)
			.foregroundColor(colorScheme == .light ? Color.ashes : .allSouls)
			.padding(.horizontal, 14)
			.padding(.vertical, 0)
	}

	@ViewBuilder
	func dayOfMonthView(_ date: Date) -> some View {
		ZStack {
			Text(dayOfMonthFormatter.string(from: date))
				.litFont(size: 16)
				.foregroundColor(
					isSelection
					? .lily
					: colorScheme == .light
					? .stellaMaris
					: .ashes)
				.frame(width: 30, height: 30)
				.background(
					isSelection
					? (colorScheme == .dark ? Color.night : Color.black)
					: Color.clear
				)
				.clipShape(Circle())
				.padding(.top, -8)
			if !isSelection && celebration.rank <= 11 {
				feastDotColor(date)
					.frame(width: 8, height: 8)
					.clipShape(Circle())
					.overlay {
						Circle().stroke(feastDotBorderColor(date))
					}
					.offset(y: 14)
			}
		}

	}

	private func feastDotColor(_ date: Date) -> Color {
		if celebration.color == .white {
			return colorScheme == .light ? Color.clear : .lily
		}
		return try! uiColorFromLitColor(
			celebration.color
		)
	}

	func feastDotBorderColor(_ date: Date) -> Color {
		if celebration.color == .white {
			return colorScheme == .light ? .ashes : .lily
		}
		return try! uiColorFromLitColor(celebration.color)
	}
}
