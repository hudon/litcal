import { LinkIcon } from "@heroicons/react/24/outline"
import Image from "next/image"

import { Button } from "@/components/Button"
import { parseDateSegment } from "@/app/dates"
import { fetchTodayCelebration } from "@/app/celebrations/db"

/**
 * Returns the color class to be used for text given a celebration
 * @param {string} [c]
 * @return {string}
 */
function colorClassForCelebration(c) {
	switch (c) {
		case "red":
			return "text-passion"
		case "green":
			return "text-figTree"
		case "violet":
			return "text-wine"
		case "rose":
			return "text-matrimony"
		case "white":
			return "text-lily"
	}

	return ""
}

/**
 * Returns the asset name for the image to show for the given celebration
 * @param {LitCelebration} c
 * @return {string}
 */
function imgAssetForCelebration(c) {
	let result =
		{
			Advent: "hero_advent",
			Christmas: "hero_christmas",
			Lent: "hero_lent",
			Easter: "hero_easter",
		}[c.season] ?? "hero_ordinary_time"

	// Pick a specific image for certain ranks
	if ([7, 8, 10, 11, 12].includes(c.rank)) {
		result = "hero_saints"
	}

	if (c.title === "Saturday Memorial of the Blessed Virgin Mary") {
		result = "hero_bvm"
	}

	// Pick a specific image for a specific key (highest priority
	return (
		({
			AllSaints: "hero_saints",
			StMaryMagdalene: "hero_mary_magdalene",
			GoodFri: "hero_good_friday",
			EasterVigil: "hero_holy_saturday",
			Easter: "hero_easter",
			Pentecost: "hero_pentecost",
			MaryMotherChurch: "hero_bvm",
			QueenshipMary: "hero_bvm",
			LadyLoreto: "hero_bvm",
			LadyLourdes: "hero_bvm",
			LadyFatima: "hero_bvm",
			LadyMountCarmel: "hero_bvm",
			LadySorrows: "hero_bvm",
			LadyRosary: "hero_bvm",
			LadyGuadalupe: "hero_bvm",
			Assumption: "hero_bvm",
		}[c.eventKey] ?? result) + ".png"
	)
}

export default function Page({ params: { date } }) {
	// TODO cache celebration for that date
	const utcDateMillis = parseDateSegment(date)
	const cel = fetchTodayCelebration(utcDateMillis)
	const dateTxt = new Date(utcDateMillis).toLocaleString("default", {
		month: "short",
		year: "numeric",
		day: "numeric",
		timeZone: "UTC",
	})
	return (
		<div className="flex flex-col items-center justify-center px-8 text-stellaMarris">
			<div className="h-10 flex-shrink-0">&nbsp;</div>
			<div className="from- relative mb-10 h-[469px] w-[951px]  flex-shrink-0 after:absolute after:bottom-0 after:left-0 after:right-0 after:top-[156px] after:bg-gradient-to-t after:from-[#010023]/70 after:to-[#010023]/0">
				<Image
					src={"/" + imgAssetForCelebration(cel)}
					alt="Image of the day"
					fill
					className="rounded-lg"
					objectFit="cover"
					objectPosition="center top"
				/>
				<div
					className={
						"absolute bottom-11 z-10 flex w-full justify-between px-12 text-white"
					}
				>
					<div>
						{dateTxt} •{" "}
						<span className={colorClassForCelebration(cel.seasonColor)}>
							{cel.season}
						</span>
					</div>
					<Button color="ourLady" href={cel.readingsURL}>
						<LinkIcon />
						{cel.gospelRef}
					</Button>
				</div>
			</div>
			<h1 className="mb-3 min-h-10 flex-shrink-0  text-center font-serif text-3xl">
				{cel.title}
			</h1>
			{cel.subtitle && (
				<h2 className="mb-3.5 min-h-10 flex-shrink-0 text-ashes">
					{cel.subtitle}
				</h2>
			)}
			<h3 className="mb-1 min-h-10 flex-shrink-0">Gospel</h3>
			<p className="w-[537px] leading-7">{cel.gospel}</p>
		</div>
	)
}
