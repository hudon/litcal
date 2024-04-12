//
//  CalWheelView.swift
//  litcal-darwin
//
//  Created by James Hudon on 7/28/22.
//

import SwiftUI
import Combine

// Reference for date format patterns: http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_Patterns
private let monthFormatter = makeGMTFormatter("MMMM y")

private struct DatesView: View {
	@Binding var selection: Int64
	@EnvironmentObject var litViewModel: LitCalendarViewModel
	let scrollProxy: ScrollViewProxy

	var body: some View {
		ScrollView(.horizontal, showsIndicators: false) {
			HStack(alignment: .top) {
				ForEach(litViewModel.datesInSeconds, id: \.self) { dateSeconds in
					WheelColumnView(
						celebration: litViewModel.celebrations[dateSeconds]!,
						isSelection: selection == dateSeconds
					)
					.onTapGesture {
						if let _ = litViewModel.celebrations[dateSeconds] {
							selection = dateSeconds
						}
					}
				}
			} // HStack
			.padding(.bottom, 3)
			.background( // Geo needs to be in a background so as to take only the space of the view that has this background
				GeometryReader { geoProxy in
					Color.clear.preference(key: ScrollViewFramePrefKey.self,
							       value: geoProxy.frame(in: .named("scrollView")))
				}
			)
		}
		.coordinateSpace(name: "scrollView") // so the child GeometryReader can calculate its offset
		.onAppear {
			withAnimation {
				scrollProxy.scrollTo(selection, anchor: .center)
			}
		}
	}
}

struct CalWheelView: View {
	@EnvironmentObject var litViewModel: LitCalendarViewModel
	@Binding var selection: Int64
	@StateObject private var viewModel = CalWheelViewModel()
	@Environment(\.colorScheme) private var colorScheme

	var body: some View {
		ScrollViewReader { scrollProxy in
			VStack(alignment: .leading) {
				HStack {
					Text(viewModel.currMonthName)
						.litFont(size: 16)
						.foregroundColor(colorScheme == .light ? .stellaMaris : .lily)
					Spacer()
					LitCalendarPicker() { date in
						if litViewModel.celebrations[date] != nil {
							DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
								withAnimation {
									scrollProxy.scrollTo(date, anchor: .center)
								}
								selection = date
							}
						}
					}
					LitButton(
						title: "Today",
						systemImageName: "bookmark",
						isEmphasized: selection != litViewModel.todaySeconds
					)
					.onTapGesture {
						selection = litViewModel.todaySeconds
						withAnimation {
							scrollProxy.scrollTo(selection, anchor: .center)
						}
					}
				}
				.padding(.horizontal, 22)

				DatesView(selection: $selection, scrollProxy: scrollProxy)

			}
			.onPreferenceChange(ScrollViewFramePrefKey.self) { scrollFrame in
				viewModel.receiveNewScrollFrame(scrollFrame: scrollFrame)
			}
			.onAppear() {
				viewModel.loadData(litViewModel)
			}

		}
	}
}

// We use a separate viewModel just so that the publisher can persist for the duration of the view lifecycle.
// The purpose of this object is just to throttle
// the scroll frame update events so that we don't compute the month title unecessarily often
class CalWheelViewModel: ObservableObject {
	/// The month that is currently shown in the app. This is not necessarily the month of the selection, because the selection can be scrolled out of view.
	@Published var currMonthName = ""
	var litViewModel: LitCalendarViewModel?


	private var unthrottledScrollFrame = PassthroughSubject<CGRect, Never>()
	private var cancellable: AnyCancellable? = nil

	init() {
		cancellable = unthrottledScrollFrame.throttle(for: 0.1, scheduler: DispatchQueue.main, latest: true)
			.sink { [weak self] in
				self?.computeCurrentMonth(scrollFrame: $0)
			}
	}

	func loadData(_ vm: LitCalendarViewModel) {
		self.litViewModel = vm
	}

	func receiveNewScrollFrame(scrollFrame: CGRect) {
		unthrottledScrollFrame.send(scrollFrame)
	}

	private func computeCurrentMonth(scrollFrame: CGRect) {
		// `origin.x` gets us the distance of the frame's x origin from the leading side of the screen
		var scrollPercentage = Double(-scrollFrame.origin.x / scrollFrame.width)

		// For an unknown reason, Previews case `scrollFrame` to be 0.0, so the `scrollPercentage` becomes NaN
#if DEBUG
		if ProcessInfo.processInfo.environment["XCODE_RUNNING_FOR_PREVIEWS"] == "1" {
			scrollPercentage = 0.5
		}
#endif

		let cels = litViewModel!.celebrations
		// By adding N to the cellAtScroll, we make the month transition happen when
		// the cell crosses the imaginary line that is N cells to the right of the leading side of the screen.
		// Without adding N, the month transition would always happen when day 1 cross the leading side of the screen.
		var cellAtScroll: Int64 = Int64(floor(scrollPercentage * Double(cels.count - 1))) + 3
		cellAtScroll = max(0, min(cellAtScroll, Int64(cels.count - 1))) // prevent out-of-bounds
		let epochAtIndex = litViewModel!.minDateSeconds + cellAtScroll * kSecondsPerDay;
		let celAtScroll = cels[epochAtIndex]!

		self.currMonthName  = monthFormatter.string(
			from: Date(timeIntervalSince1970: TimeInterval(celAtScroll.epochSeconds))
		)
	}
}

private struct ScrollViewFramePrefKey: PreferenceKey {
	static var defaultValue: CGRect = CGRect.zero
	static func reduce(value: inout CGRect, nextValue: () -> CGRect) {
	}
}


struct CalWheelView_Previews: PreviewProvider {
	static let litViewModel = try! LitCalendarViewModel()
	@State static var now = Int64(Date.now.timeIntervalSince1970)
	static var previews: some View {
		CalWheelView(selection: $now)
			.environmentObject(litViewModel)
	}
}


