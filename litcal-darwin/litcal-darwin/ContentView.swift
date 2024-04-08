//
//  ContentView.swift
//  litcal-darwin
//
//  Created by James Hudon on 6/27/22.
//

import SwiftUI


struct ContentView: View {
	@State var selectedDateSeconds: Int64
	@State var isWheelShown = true
	@Environment(\.colorScheme) private var colorScheme

	var body: some View {
		VStack {
			HStack {
				Image(colorScheme == .light ? "header_title" : "header_title_inverted")
					.resizable()
					.frame(width: 76, height: 24)

				Image(systemName: isWheelShown ? "chevron.up" : "chevron.down")
					.font(.system(size: 14, weight: .medium))
					.foregroundColor(.ashes)
					.animation(nil, value: isWheelShown)
				Spacer()
			}
			.padding(.bottom, 3)
			.onTapGesture {
				withAnimation {
					isWheelShown.toggle()
				}
			}
			.padding(.leading, 22)

			VStack {
				Divider()
				CalWheelView(selection: $selectedDateSeconds)
					.padding(.top, 8)
			}
			.opacity(isWheelShown ? 1.0 : 0.0)
			.frame(
				maxHeight: isWheelShown ? nil : 0,
				alignment: isWheelShown ? .center : .bottom
			)
			.clipped()
			.padding(.bottom, 8)

			DayView(dateSeconds: selectedDateSeconds)
		}
		.padding(.top)
	}
}

struct ContentView_Previews: PreviewProvider {
	static let litVM = try! LitCalendarViewModel(includeMoreYears: false)
	static var previews: some View {
		ContentView(selectedDateSeconds: litVM.todaySeconds)
			.environmentObject(litVM)
	}
}
