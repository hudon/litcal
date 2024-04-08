//
//  litdb.swift
//  litcal-darwin
//
//  Created by James Hudon on 4/8/24.
//

import Foundation

struct LitDB {
	static let calID: Int32 = 1
}

enum LitError: Error {
	case unknown
	case error(message: String)

	init() {
		self = .unknown
	}

	/// This will free the lit_error memory when done
	init(_ maybeErr: UnsafeMutablePointer<lit_error>?) {
		guard let err = maybeErr else {
			self = .unknown
			return
		}
		let msg = withUnsafeBytes(of: &err.pointee.message) { (rawPtr) -> String in
			let ptr = rawPtr.baseAddress!.assumingMemoryBound(to: CChar.self)
			return String(cString: ptr)
		}
		self = .error(message: msg)
		lit_error_free(err)
	}
}

func fixedCStrToString<T>( _ cstr: inout T) -> String {
	return withUnsafeBytes(of: &cstr) { (rawPtr) -> String in
		let ptr = rawPtr.baseAddress!.assumingMemoryBound(to: CChar.self)
		return String(cString: ptr)
	}
}

func fixedCStrToString<T, K>(_ root: T, _ keyPath: KeyPath<T, K>) -> String {
	var cstr = root[keyPath: keyPath]
	return fixedCStrToString(&cstr)
}

struct LitCelebrationBridge {
	let cel: lit_celebration

	let color: lit_color
	let eventKey: String
	let title: String
	let subtitle: String
	let gospelRef: String
	let readingsUrl: String
	let gospelText: String
	let rank: Int
	let epochSeconds: Int64
	let season: String

	init(cel: lit_celebration) {
		self.cel = cel
		self.color = cel.color
		self.eventKey = fixedCStrToString(cel, \.event_key)
		self.title = fixedCStrToString(cel, \.title)
		self.subtitle = fixedCStrToString(cel, \.subtitle)
		self.gospelRef = fixedCStrToString(cel, \.gospel_ref)
		self.readingsUrl = String(cString: cel.readings_url)
		self.gospelText = String(cString: cel.gospel_text)
		self.rank = Int(cel.rank)
		self.epochSeconds = cel.epoch_seconds
		self.season = fixedCStrToString(cel, \.season)
	}
}
