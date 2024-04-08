//
//  LitButton.swift
//  litcal-darwin
//
//  Created by James Hudon on 9/23/22.
//

import SwiftUI

struct LitButton: View {
	@Environment(\.colorScheme) private var colorScheme
	let title: String
	let systemImageName: String
	var isEmphasized = false

	// TODO: wrap this in a Button when making this available outside of iOS
	//https://stackoverflow.com/a/66021051/1116674
	var body: some View {
		Label(title, systemImage: systemImageName)
			.litFont(size: 10)
			.padding(.vertical, 6)
			.padding(.horizontal, 8)
			.foregroundColor(
				isEmphasized
				? Color.lily
				: colorScheme == .light
				? .ashes
				: .ashes)
			.background(
				isEmphasized
				? Color.ourLady
				: colorScheme == .light
				? .dove
				: .night
			)
			.clipShape(RoundedRectangle(cornerRadius: 4))
	}
}

struct LitButton_Previews: PreviewProvider {
	static var previews: some View {
		LitButton(title: "USA", systemImageName: "calendar", isEmphasized: true)
	}
}

