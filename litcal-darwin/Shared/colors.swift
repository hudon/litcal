//
//  colors.swift
//  litcal-darwin
//
//  Created by James Hudon on 4/8/24.
//

import SwiftUI

struct FgTextColorModifier: ViewModifier {
	@Environment(\.colorScheme) private var colorScheme
	
	func body(content: Content) -> some View {
		content.foregroundColor(
			colorScheme == .light
			? .stellaMaris
			: .ashes
		)
	}
}

extension Color {
	// System
	static let ashes = Color(red: 0.702, green: 0.702, blue: 0.702)
	static let dove = Color(red: 0.942, green: 0.942, blue: 0.942)
	static let allSouls = Color(red: 0.282, green: 0.282, blue: 0.29)
	static let ourLady = Color(red: 0.2, green: 0.6, blue: 1.0)
	static let night = Color(red: 0.173, green: 0.173, blue: 0.18)
	static let stellaMaris = Color(red: 0.003, green: 0, blue: 0.138)
	// Liturgical
	static let figTree = Color(red: 0.184, green: 0.694, blue: 0.267)
	static let wine = Color(red: 0.686, green: 0.322, blue: 0.871)
	static let passion = Color(red: 0.921, green: 0.335, blue: 0.15)
	static let chalice = Color(red: 0.925, green: 0.742, blue: 0.008)
	static let matrimony = Color(red: 0.945, green: 0.663, blue: 0.627)
	static let lily = Color(red: 1, green: 1, blue: 1)
}

func gradientFromLitColor(
	_ c: lit_color,
	colorScheme: ColorScheme,
	lightStartOpacity: CGFloat = 0.3,
	darkStartOpacity: CGFloat = 0.25
) throws -> Gradient {
	let color = try uiColorFromLitColor(c)
	return Gradient(colors: [color.opacity(colorScheme == .light ? lightStartOpacity : darkStartOpacity), color.opacity(0)])
}

func uiColorFromLitColor(_ color: lit_color) throws -> Color {
	switch (color) {
	case LIT_BLACK:
		return .allSouls
	case LIT_GREEN:
		return .figTree
	case LIT_RED:
		return .passion
	case LIT_WHITE:
		return .lily
	case LIT_VIOLET:
		return .wine
	case LIT_ROSE:
		return.matrimony
	case LIT_GOLD:
		return .chalice
	case LIT_SILVER:
		return .ashes
	default:
		throw LitError.unknown
	}
}
