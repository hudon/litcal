//
//  LitCalendarHolyDays.swift
//  litcal-darwin
//
//  Created by James Hudon on 10/27/22.
//

import SwiftUI

private let dateFormatter = makeGMTFormatter("MMM d")

private struct HolyDay: Identifiable {
	let date: Date
	let name: String
	let id = UUID()
	var dateAsInt: Int {
		Int(date.timeIntervalSince1970)
	}
}

struct ScrollContentBackgroundHidden: ViewModifier {
	func body(content: Content) -> some View {
		if #available(iOS 16.0, *) {
			content.scrollContentBackground(.hidden)
		} else {
			content
		}
	}
}

struct LitCalendarHolyDays: View {
	let shortName: String
	var dateAction: ((Int) -> Void)? = nil

	private let holyDaysByYear: [String: [HolyDay]] = [
		"2023": [
			HolyDay(date: dateFromComponents(year: 2023, month: 8, day: 15)!,
				name: "The Assumption of the Blessed Virgin Mary"),
			HolyDay(date: dateFromComponents(year: 2023, month: 11, day: 1)!,
				name: "All Saints"),
			HolyDay(date: dateFromComponents(year: 2023, month: 12, day: 8)!,
				name: "The Immaculate Conception of the Blessed Virgin Mary"),
			HolyDay(date: dateFromComponents(year: 2023, month: 12, day: 25)!,
				name: "The Nativity of the Lord")

		],
		"2024": [
			HolyDay(date: dateFromComponents(year: 2024, month: 8, day: 15)!,
				name: "The Assumption of the Blessed Virgin Mary"),
			HolyDay(date: dateFromComponents(year: 2024, month: 11, day: 1)!,
				name: "All Saints"),
			HolyDay(date: dateFromComponents(year: 2024, month: 12, day: 25)!,
				name: "The Nativity of Our Lord"),
			// if you add Christmas you should make sure we have the events for it... or Add Christmas but break the link.
			// TODO: also, looks like the All Saints link isn't working?
		]
	]

	@Environment(\.colorScheme) private var colorScheme

	var body: some View {
		VStack {
			Text("Holy Days of Obligation [" + shortName + "]")
				.litFont(size: 16, weight: .semibold)
				.foregroundColor(colorScheme == .light ? .stellaMaris : .lily)

			List {
				ForEach(holyDaysByYear.keys.sorted(), id: \.self) { yearStr in
					Section(header: Text(yearStr).litFont(size: 14)) {
						ForEach(holyDaysByYear[yearStr]!) { hday in
							Button("**\(dateFormatter.string(from: hday.date))** - \(hday.name)", action: {
								if let action = dateAction {
									action(hday.dateAsInt)
								}
							})
							.buttonStyle(.plain)
							.litFont(size: 14)

							.padding(.trailing)
							.padding(.vertical, 5)
							//                            .modifier(FgTextColorModifier())
						}
					}
					//                    .background(Color.dove)

				}
			}
			//            .background(Color.dove)
			//            .modifier(ScrollContentBackgroundHidden())
			//            .scrollContentBackground(.hidden)
		}
	}
}

struct LitCalendarHolyDays_Previews: PreviewProvider {
	static var previews: some View {
		LitCalendarHolyDays(shortName: "USA")
	}
}
