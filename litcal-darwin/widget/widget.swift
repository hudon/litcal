//
//  widget.swift
//  widget
//
//  Created by James Hudon on 9/21/22.
//

import WidgetKit
import SwiftUI

// TODO: do I need to use this? Like if the user checks their Home Screen at 23:59 and then it ticks to midnight, will the widget update?
struct Provider: TimelineProvider {
	func placeholder(in context: Context) -> SimpleEntry {
		SimpleEntry(date: Date())
	}

	func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
		let entry = SimpleEntry(date: Date())
		completion(entry)
	}

	func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
		let currentDate = Date()
		let midnight = Calendar.current.startOfDay(for: currentDate)
		let nextMidnight = Calendar.current.date(byAdding: .day, value: 1, to: midnight)!

		let entries = [
			SimpleEntry(date: currentDate)
		]

		let timeline = Timeline(entries: entries, policy: .after(nextMidnight))
		completion(timeline)
	}
}

struct SimpleEntry: TimelineEntry {
	let date: Date
}

extension View {
	func widgetBackground(_ backgroundView: some View) -> some View {
		if #available(iOSApplicationExtension 17.0, *) {
			return containerBackground(for: .widget) {
				backgroundView
			}
		} else {
			return background(backgroundView)
		}
	}
}

private let cardDateTitleFormatter = makeGMTFormatter("MMM d, y")


// TODO: check out the widget families: https://developer.apple.com/documentation/widgetkit/creating-a-widget-extension
struct widgetEntryView : View {
	var entry: Provider.Entry
	@EnvironmentObject var litViewModel: LitCalendarViewModel
	@Environment(\.colorScheme) var colorScheme
	@Environment(\.widgetFamily) var widgetFamily

	var litCel: LitCelebration {
		litViewModel.todayCelebration
	}

	var litColor: Color {
		try! uiColorFromLitColor(litCel.color)
	}

	var imgFileName: String {
		switch (litColor) {

		case .figTree:
			return "gradient_figtree"
		case .wine:
			return "gradient_wine"
		case .passion:
			return "gradient_passion"
		case .chalice:
			return "gradient_chalice"
		case .matrimony:
			return "gradient_matrimony"
		case .lily:
			return "gradient_lily"
		default:
			return "gradient_lily"
		}

	}

	var body: some View {
		// The ZStack helps the corner logo, which needs an HStack, not take space away from the content VStack
		ZStack(alignment: .topLeading) {
			HStack {
				Spacer()

				Image("corner_logo")
					.resizable()
					.frame(width: 21, height: 21)
			}

			VStack(alignment:.leading) {

				Spacer()

				HStack {
					Rectangle()
						.frame(width: 2, height: widgetFamily == .systemMedium
						       ? 28 : 22)
						.foregroundColor(litColor)

					VStack(alignment: .leading) {
						Text(litCel.season)
							.litFont(size: widgetFamily == .systemMedium
								 ? 10 : 8)
							.foregroundColor(.ashes)

						Text(cardDateTitleFormatter.string(from: litViewModel.todayDate))
							.litFont(size: widgetFamily == .systemMedium
								 ? 14 : 12)
							.foregroundColor(.lily)
					}
					.padding(.leading, -2)
				}

				Text(litCel.title)
					.litFont(size: widgetFamily == .systemMedium
						 ? 16 : 14, weight: .title)
					.foregroundColor(.lily)

				if widgetFamily == .systemMedium && litCel.subtitle.count > 0 {
					Text(litCel.subtitle)
						.litFont(size: 10)
						.foregroundColor(.ashes)
				}
			}
		}
		.padding(widgetFamily == .systemMedium ? 22 : 14)
		.background(
			Image("noise_medium")
		)
		.widgetBackground(
			ZStack{
				Color.stellaMaris
				//                    .ignoresSafeArea()

				Image(imgFileName)
					.offset(
						x: widgetFamily == .systemMedium
						? 145
						: 100,
						y: -85
					)
			}

		)
	}
}

@main
struct widget: Widget {
	let kind: String = "widget"
	@StateObject private var litViewModel = try! LitCalendarViewModel()

	var body: some WidgetConfiguration {
		StaticConfiguration(kind: kind, provider: Provider()) { entry in
			widgetEntryView(entry: entry)
				.environmentObject(litViewModel)
		}
		.configurationDisplayName("Feast of the day")
		.description("View today's liturgical feast.")
		.supportedFamilies([.systemSmall, .systemMedium])
		// TODO: make sure this looks good everywhere, or disabled environments I
		// don't want to support (Watch, macOS, etc.)
		.contentMarginsDisabled()
	}
}

struct widget_Previews: PreviewProvider {
	static let litVM = try! LitCalendarViewModel()
	static var previews: some View {
		widgetEntryView(entry: SimpleEntry(date: Date()))
			.previewContext(WidgetPreviewContext(family: .systemMedium))
			.environmentObject(litVM)
	}
}
