//
//  DayImageView.swift
//  litcal-darwin
//
//  Created by James Hudon on 6/27/22.
//

import SwiftUI

struct DayImageView: View {
	let cel: LitCelebrationBridge
	let frameHeight: CGFloat = 239
	let frameWidth: CGFloat = 400

	var imgName: String {
		var result = "hero_ordinary_time"

		// Default to a seasonal choice
		switch cel.season {
		case "Advent":
			result = "hero_advent"
		case "Christmas":
			result = "hero_christmas"
		case "Lent":
			result = "hero_lent"
		case "Easter":
			result = "hero_easter"
		default:
			break
		}

		// Pick a specific image for certain ranks
		switch cel.rank {
		case 7, 8, 10, 11, 12:
			result = "hero_saints"
		default: break
		}

		if cel.title == "Saturday Memorial of the Blessed Virgin Mary" {
			result = "hero_bvm"
		}

		// Pick a specific image for a specific key (highest priority
		switch cel.eventKey {
		case "StMaryMagdalene":
			result = "hero_mary_magdalene"
		case "GoodFri":
			result = "hero_good_friday"
		case "EasterVigil":
			// Easter Vigil shouldn't be listed really... it should be Holy Saturday. But there is no Mass for Holy Saturday I believe.
			result = "hero_holy_saturday"
		case "Easter":
			result = "hero_easter"
		case "Pentecost":
			result = "hero_pentecost"
		case "MaryMotherChurch", "QueenshipMary", "LadyLoreto",
			"LadyLourdes", "LadyFatima", "LadyMountCarmel",
			"LadySorrows", "LadyRosary", "LadyGuadalupe":
			result = "hero_bvm"
		default:
			break
		}



		return result
	}

	var body: some View {
		Image(imgName)
			.resizable()
			.aspectRatio(contentMode: .fill)
	}
}

struct DayImageView_Previews: PreviewProvider {
	static let vm = try! LitCalendarViewModel()
	static var previews: some View {
		DayImageView(cel: vm.todayCelebration)
			.frame(width: 400, height: 239)
	}
}
