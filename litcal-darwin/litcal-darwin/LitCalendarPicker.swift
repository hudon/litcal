//
//  LitCalendarPicker.swift
//  litcal-darwin
//
//  Created by James Hudon on 7/25/22.
//

import SwiftUI

struct LitCalendarPicker: View {
	var dateAction: ((Int64) -> Void)? = nil
	@State private var isShowingSheet = false
	let shortName = "USA"

	var body: some View {
		LitButton(title: shortName, systemImageName: "calendar", isEmphasized: true)
			.onTapGesture {
				isShowingSheet.toggle()
			}
			.sheet(isPresented: $isShowingSheet) {
				VStack {
					HStack {
						Spacer()
						Button("Dismiss", action: { isShowingSheet.toggle() })
					}
					.padding(.horizontal)
					.padding(.bottom, 5)

					Divider()

					LitCalendarHolyDays(shortName: shortName) { date in
						self.isShowingSheet = false
						if let action = dateAction {
							action(date)
						}
					}
					.padding(.top)
				}
				.padding(.top)
			}
	}
}

struct LitCalendarPicker_Previews: PreviewProvider {
	static var previews: some View {
		LitCalendarPicker()
	}
}
