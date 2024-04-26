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

private struct TitleCard: View {
	@Environment(\.colorScheme) private var colorScheme
	let dateSeconds: Int64
	let litCel: LitCelebration
	let parentWidth: CGFloat

	var litColor: Color {
		try! uiColorFromLitColor(litCel.color)
	}

	private var date: Date {
		Date(timeIntervalSince1970: TimeInterval(dateSeconds))
	}

	var body: some View {
		VStack {
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
		.frame(width: parentWidth * 0.75)
		.background(
			// Geo needs to be in a background so as to take only the space of the view that has this background
			GeometryReader { geoProxy in
				Color.clear.preference(
					key: FrameHeightPrefKey.self,
					value: geoProxy.size.height)
			}
				.background(colorScheme == .light ? Color.white : Color.night)
		)
		.clipShape(RoundedRectangle(cornerSize: CGSize(width: 6, height: 6)))
		.shadow(color: Color(red: 0.004, green: 0.0, blue: 0.133, opacity: 0.05), radius: 14, x: 0, y: 4)
	}
}

private struct Gospel: View {
	let litCel: LitCelebration
	var body: some View {
		VStack {
			// Header
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

			}
			.padding(.bottom)

			Text(litCel.gospelText)
				.litFont(size: 15)
				.lineSpacing(4.0)
				.modifier(FgTextColorModifier())
		}
		.padding(.horizontal, 32)
		.padding(.bottom)
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

struct DayView: View {
	@State private var zStackHeight: CGFloat = 0.0
	private let zStackBottomPad: CGFloat = 25
	private let imageFrameHeight: CGFloat = 240
	private let titleCardOverlapHeight: CGFloat = 45

	@Environment(\.colorScheme) private var colorScheme
	@EnvironmentObject var litViewModel: LitCalendarViewModel
	let dateSeconds: Int64

	var litCel: LitCelebration {
		litViewModel.celebrations[dateSeconds]!
	}

	var litGradient: Gradient {
		try! gradientFromLitColor(litCel.color, colorScheme: colorScheme)
	}

	var body: some View {
		GeometryReader { scrollViewGeo in
			ScrollView(showsIndicators: false) {
				// Z axis to put the title card above
				ZStack(alignment: .bottom) {
					VStack(spacing: 0) {
						DayImageView(cel: litCel)
							.background(
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
						.opacity(litCel.color == .white ? 0.0 : 1.0)
					}
					TitleCard(
						dateSeconds: dateSeconds,
						litCel: litCel,
						parentWidth: scrollViewGeo.size.width
					)
					.padding(.bottom, zStackBottomPad)
				}
				.frame(height: zStackHeight)
				.onPreferenceChange(FrameHeightPrefKey.self) { cardFrameHeight in
					zStackHeight =  cardFrameHeight - titleCardOverlapHeight + zStackBottomPad
				}

				Gospel(litCel: litCel)
				
			} // georeader
		} // scrollview
	} // body
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
	// might need to update these as time goes on
	static var adventSunday = dateFromComponents(
		year: 2024, month: 11, day: 28
	)!.timeIntervalSince1970
	static var christKing = dateFromComponents(
		year: 2024, month: 11, day: 20
	)!.timeIntervalSince1970
	static var saintLuke = dateFromComponents(
		year: 2024, month: 10, day: 18
	)!.timeIntervalSince1970

	static var previews: some View {
		DayView(dateSeconds: Int64(saintLuke))
			.environmentObject(litCal)
	}
}
