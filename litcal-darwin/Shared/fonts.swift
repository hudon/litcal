//
//  fonts.swift
//  litcal-darwin
//
//  Created by James Hudon on 4/8/24.
//

import SwiftUI

/// "Title" is not so much a weight as a different font entirely, but for the sake of our small custom font modifier, this abuse of "weight" is fine
enum LitFontWeight {
	case regular
	case semibold
	case title
}

struct LitFont: ViewModifier {
	let size: CGFloat
	let fontName: String
	
	init(size: CGFloat, weight: LitFontWeight) {
		self.size = size
		switch weight {
		case .regular:
			self.fontName = "EuclidSquare-Regular"
		case .semibold:
			self.fontName = "EuclidSquare-Semibold"
		case .title:
			self.fontName = "TiemposHeadline-Medium"
		}
	}

	func body(content: Content) -> some View {
		content
			.font(.custom(fontName, size: size))
	}
}

extension View {
	func litFont(size: CGFloat = 14, weight: LitFontWeight = .regular) -> some View {
		modifier(LitFont(size: size, weight: weight))
	}

	func litTitleFont(size: CGFloat = 14) -> some View {
		modifier(LitFont(size: size, weight: .title))
	}
}
