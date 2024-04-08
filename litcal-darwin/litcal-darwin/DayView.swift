//
//  DayView.swift
//  litcal-darwin
//
//  Created by James Hudon on 6/27/22.
//

import SwiftUI

private let cardDateTitleFormatter = makeGMTFormatter("MMM d, y")

enum DayViewError: Error {
	case unknownColor
}

struct DayView: View {
	@State private var zStackHeight: CGFloat = 0.0
	private let zStackBottomPad: CGFloat = 25
	private let imageFrameHeight: CGFloat = 240
	private let titleCardOverlapHeight: CGFloat = 45

	@Environment(\.colorScheme) private var colorScheme
	@EnvironmentObject var litViewModel: LitCalendarViewModel
	let dateSeconds: Int

	var litCel: LitCelebrationBridge {
		litViewModel.celebrations[dateSeconds]!
	}

	var litColor: Color {
		// TODO: fixme white color
		try! uiColorFromLitColor(litCel.color)
	}
	var litGradient: Gradient {
		try! gradientFromLitColor(litCel.color, colorScheme: colorScheme)
	}
	private var date: Date {
		Date(timeIntervalSince1970: TimeInterval(dateSeconds))
	}

	var body: some View {

		ScrollView(showsIndicators: false) {
			// ZStack to put the title card above
			ZStack(alignment: .bottom) {
				VStack(spacing: 0) {
					DayImageView(cel: litCel)
						.background(
							// Geo needs to be in a background so as to take only the space of the view that has this background
							GeometryReader { geoProxy in
								Color.clear.preference(
									key: FrameHeightPrefKey.self,
									value: geoProxy.size.height)
							}
						)

					LinearGradient(
						gradient: litGradient,
						startPoint: UnitPoint(x: 0.5, y: 0),
						endPoint: UnitPoint(x: 0.5, y: 1.0))
					.opacity(litCel.color == LIT_WHITE ? 0.0 : 1.0)
				}

				// Title Card
				VStack {
					// TODO: fixme
					Text(cardDateTitleFormatter.string(from: date) + " · " + litCel.season)
						.foregroundColor(colorScheme == .light ? .ashes : litColor)
						.litFont(size: 10, weight: .semibold)
						.padding(.bottom, 1)

					Divider()
						.frame(width: 18)
						.background(Color.ashes)
						.padding(.vertical, 4)

					Text(litCel.title)
						.litTitleFont(size: 21)
						.multilineTextAlignment(.center)
						.foregroundColor(colorScheme == .light ? .stellaMaris : .white)
						.padding(.bottom, 2)

					if litCel.subtitle.count > 0 {
						Text(litCel.subtitle)
							.litFont(size: 14)
							.multilineTextAlignment(.center)
							.foregroundColor(.ashes)
					}

				} // VStack: Title Card
				.padding(.vertical, 16)
				.padding(.horizontal, 24)
				.frame(width: 315)
				.background(
					// Geo needs to be in a background so as to take only the space of the view that has this background
					GeometryReader { geoProxy in
						Color.clear.preference(key: FrameHeightPrefKey.self,
								       value: geoProxy.size.height)
					}
						.background(colorScheme == .light ? Color.white : Color.night)
				)
				.clipShape(RoundedRectangle(cornerSize: CGSize(width: 6, height: 6)))
				.shadow(color: Color(red: 0.004, green: 0.0, blue: 0.133, opacity: 0.05), radius: 14, x: 0, y: 4)
				.padding(.bottom, zStackBottomPad)
			} // ZStack: Outer container
			.frame(height: zStackHeight)
			.onPreferenceChange(FrameHeightPrefKey.self) { cardFrameHeight in
				zStackHeight =  cardFrameHeight - titleCardOverlapHeight + zStackBottomPad
			}

			// Gospel section
			VStack {
				// Header for the Gospel
				HStack {
					Text("Gospel")
						.litFont(size: 18, weight: .semibold)

					Spacer()

					readingsURLView(URL(string: litCel.readingsUrl)) {
						Label(litCel.gospelRef, systemImage: "link")
							.litFont(size: 12)
							.foregroundColor(Color.white)
					}
					.padding(.vertical, 5)
					.padding(.horizontal, 9)
					.background(Color.ourLady)
					.clipShape(RoundedRectangle(cornerRadius: 4))

				} // HStack: Gospel Header
				.padding(.bottom)

				Text(litCel.gospelText)
					.litFont(size: 15)
					.lineSpacing(4.0)
					.modifier(FgTextColorModifier())
			} // Vstack: Gospel section
			.padding(.horizontal, 32)
			.padding(.bottom)
		}
	}

	@ViewBuilder
	func readingsURLView(_ maybeUrl: URL?, closure: () -> some View) -> some View {
		if let url = maybeUrl {
			Link(destination: url) {
				closure()
			}
		} else {
			closure()
		}
	}
}

private struct FrameHeightPrefKey: PreferenceKey {
	static var defaultValue: CGFloat = 0.0
	static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
		value += nextValue()
	}
}

struct DayView_Previews: PreviewProvider {
	static let litCal = try! LitCalendarViewModel()
	static var sep17: Date {
		Date(timeIntervalSince1970: TimeInterval(1663372800))
	}
	static var adventSunday = dateFromComponents(
		year: 2023, month: 11, day: 28
	)!.timeIntervalSince1970
	static var christKing = dateFromComponents(
		year: 2023, month: 11, day: 20
	)!.timeIntervalSince1970
	static var saintLuke = dateFromComponents(
		year: 2023, month: 10, day: 18
	)!.timeIntervalSince1970

	static var previews: some View {
		DayView(dateSeconds: Int(saintLuke))
			.environmentObject(litCal)
	}
}
