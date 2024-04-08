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
	// TODO: handle days for which we don't have celebrations?
	let celebration: LitCelebrationBridge
	// TODO: If we don't have the litDay, we'll disable that cell's interaction but still show it
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
					//                    celebration == nil
					//                    ? Color.ashes
					//                    :
					isSelection
					? .lily
					: colorScheme == .light
					? .stellaMaris
					: .ashes)
				.frame(width: 30, height: 30)
				.background(
					isSelection
					? (colorScheme == .dark ? Color(white: 0.192) : Color.black)
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

	// Set whiteToGray when we cannot use White because the background would cause white foreground to be hidden
	private func feastDotColor(_ date: Date) -> Color {
		if celebration.color == LIT_WHITE {
			return colorScheme == .light ? Color.clear : .lily
		}
		return try! uiColorFromLitColor(
			celebration.color
		)
	}

	func feastDotBorderColor(_ date: Date) -> Color {
		if celebration.color == LIT_WHITE {
			return colorScheme == .light ? .ashes : .lily
		}
		return try! uiColorFromLitColor(
			celebration.color)
	}
}
