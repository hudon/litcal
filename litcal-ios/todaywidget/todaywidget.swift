//
//  todaywidget.swift
//  todaywidget
//
//  Created by James Hudon on 4/5/24.
//

import WidgetKit
import SwiftUI

//import litcal-ios

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

private let cardDateTitleFormatter = makeDateFormatterWithFormat("MMM d, y")


// TODO: check out the widget families: https://developer.apple.com/documentation/widgetkit/creating-a-widget-extension
struct todaywidgetEntryView : View {
    var entry: Provider.Entry
    @EnvironmentObject var viewModel: WidgetViewModel
    @Environment(\.colorScheme) var colorScheme
    @Environment(\.widgetFamily) var widgetFamily


	var litCel: LitCelebrationBridge {
		 try! viewModel.celebrationFor(
			epochSeconds: makeTodaySeconds()!)
	}

//    var litColor: Color {
//	    uiColorFromLitColor(litCel.color)!
////	uiColorFromLColor(lColor: litCel.color, colorScheme: colorScheme)
//    }

//    var imgFileName: String {
//	    switch (litCel.color) {
//
//	case FIG_TREE:
//	    return "gradient_figtree"
//	case .wine:
//	    return "gradient_wine"
//	case .passion:
//	    return "gradient_passion"
//	case .chalice:
//	    return "gradient_chalice"
//	case .matrimony:
//	    return "gradient_matrimony"
//	case .lily:
//	    return "gradient_lily"
//	default:
//	    return "gradient_lily"
//	}
//
//    }

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
//			.foregroundColor(litColor)


//		    VStack(alignment: .leading) {
//			Text(litDay.season.name)
//			    .litFont(size: widgetFamily == .systemMedium
//				     ? 10 : 8)
//			    .foregroundColor(.ashes)
//
//			Text(cardDateTitleFormatter.string(from: litViewModel.todayDate))
//			    .litFont(size: widgetFamily == .systemMedium
//				     ? 14 : 12)
//			    .foregroundColor(.lily)
//		    }
//		    .padding(.leading, -2)
		}

		Text(litCel.title)
//		    .litFont(size: widgetFamily == .systemMedium
//			     ? 16 : 14, weight: .title)
//		    .foregroundColor(.lily)

		if widgetFamily == .systemMedium && litCel.subtitle.count > 0 {
		    Text(litCel.subtitle)
//			.litFont(size: 10)
//			.foregroundColor(.ashes)
		}
	    }
	}
	.padding(widgetFamily == .systemMedium ? 22 : 14)
	.background(
	    Image("noise_medium")
	)
	.background(
	    ZStack{
//		Color.stellaMaris
//                    .ignoresSafeArea()

//		Image(imgFileName)
//		    .offset(
//			x: widgetFamily == .systemMedium
//			? 145
//			: 100,
//			y: -85
//		    )
	    }

	)

    }
}

enum LitError: Error {
	case error(message: String)

	init(_ litErr: UnsafeMutablePointer<lit_error>) {
		let msg = withUnsafeBytes(of: &litErr.pointee.message) { (rawPtr) -> String in
			let ptr = rawPtr.baseAddress!.assumingMemoryBound(to: CChar.self)
			return String(cString: ptr)
		}
		lit_error_free(litErr)
		self = .error(message: msg)
	}
}


class WidgetViewModel: ObservableObject {

	let db: OpaquePointer
	init(bundle: Bundle = .main) throws {
		var errPtr: UnsafeMutablePointer<lit_error>?
		var dbPtr: OpaquePointer?
		openDBAtBundleRoot(&dbPtr, &errPtr)
		if let resultError = errPtr {
			throw LitError(resultError)
		}
		self.db = dbPtr!
	}

	func celebrationFor(epochSeconds: NSNumber) throws -> LitCelebrationBridge  {
		var cel = lit_celebration();
		var errPtr: UnsafeMutablePointer<lit_error>?
		if (!lit_get_celebration(self.db, UInt64(kCalID), Int64(truncating: epochSeconds), &cel, &errPtr)) {
			throw LitError(errPtr!)
		}
		return LitCelebrationBridge(cLitCelebration: cel)
	}

	deinit {
		// TODO: cleanup db
	}
}

struct todaywidget: Widget {
	let kind: String = "todaywidget"
	@StateObject private var viewModel = try! WidgetViewModel()

	var body: some WidgetConfiguration {
		StaticConfiguration(kind: kind, provider: Provider()) { entry in
			if #available(iOS 17.0, *) {
				todaywidgetEntryView(entry: entry)
					.environmentObject(viewModel)
					.containerBackground(.fill.tertiary, for: .widget)
			} else {
				todaywidgetEntryView(entry: entry)
					.environmentObject(viewModel)
					.padding()
					.background()
			}
		}
		.configurationDisplayName("Feast of the day")
		.description("View today's liturgical feast.")
	}
}

#Preview(as: .systemSmall) {
    todaywidget()
} timeline: {
    SimpleEntry(date: .now)
    SimpleEntry(date: .now)
}
