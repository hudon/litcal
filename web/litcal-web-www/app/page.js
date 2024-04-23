import { LinkIcon } from "@heroicons/react/24/outline"
import Database from "better-sqlite3"
import Image from "next/image"

import Button from "@/app/Button"

// function fetchCelebrations() {
// 	// this is pulled from litdb... use litdb if logic needs to be shared
// 	const db = new Database("../../litcal.sqlite")
// 	const queryStr =
// 		"SELECT lc.event_key, lc.rank, lc.title, lc.subtitle, lc.gospel, " +
// 		"lc.gospel_ref, lc.readings_url, lcol.name AS color, ls.name, " +
// 		"ld.secular_date_s, COUNT(*) OVER () " +
// 		"FROM lit_celebration lc " +
// 		"JOIN lit_day ld ON lc.lit_day_id = ld.id " +
// 		"JOIN lit_color lcol ON lc.lit_color_id = lcol.id " +
// 		"JOIN lit_season ls ON ld.lit_season_id = ls.id " +
// 		"JOIN lit_year ly ON ls.lit_year_id = ly.id " +
// 		"WHERE ld.secular_date_s >= ? AND ld.secular_date_s <= ? AND ly.lit_calendar_id = ? " +
// 		"ORDER BY ld.secular_date_s;"
// 	db.each(
// 		queryStr,
// 		1704931200,
// 		1704931200 + 3 * 24 * 60 * 60,
// 		1,
// 		(err, row) => {
// 			console.log(row.secular_date_s + ": " + row.title)
// 		},
// 	)
// 	db.close()
// }

/**
 * A liturgical celebration
 * @typedef {Object} LitCelebration
 * @property {string} title
 * @property {string} subtitle
 * @property {string} gospel
 * @property {number} rank
 * @property {number} dateSeconds
 */

/**
 * Get the Liturgical celebration for today
 *
 * @return {LitCelebration}
 */
function fetchTodayCelebration() {
	const today = new Date()
	const todayInEpochSeconds =
		Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 1000
	const db = new Database("../../litcal.sqlite")
	const queryStr =
		"SELECT lc.event_key, lc.rank, lc.title, lc.subtitle, lc.gospel, " +
		"lc.gospel_ref, lc.readings_url, lcol.name AS color, ls.name, " +
		"ld.secular_date_s " +
		"FROM lit_celebration lc " +
		"JOIN lit_day ld ON lc.lit_day_id = ld.id " +
		"JOIN lit_color lcol ON lc.lit_color_id = lcol.id " +
		"JOIN lit_season ls ON ld.lit_season_id = ls.id " +
		"JOIN lit_year ly ON ls.lit_year_id = ly.id " +
		"WHERE ld.secular_date_s = ? AND ly.lit_calendar_id = ? "
	/** @type {any} */
	const row = db.prepare(queryStr).get(todayInEpochSeconds, 1)
	row.dateSeconds = row.secular_date_s
	return row
}

export default function Page() {
	const cel = fetchTodayCelebration()
	return (
		<div className="flex flex-col items-center justify-center px-8 text-stellaMarris">
			<div className="h-10 flex-shrink-0">&nbsp;</div>
			<div className="relative mb-10 h-[469px] w-[951px] flex-shrink-0">
				<Image
					src="/hero_ordinary_time.png"
					alt="Image of the day"
					fill
					className="rounded-lg"
					objectFit="cover"
					objectPosition="center top"
				/>
				<div className="absolute bottom-11 flex w-full justify-between px-12 text-white">
					<div>Jul 11, 2022 • Ordinary Time</div>
					<Button
						label="MT 14:13-21"
						Icon={LinkIcon}
						bgColorClass="bg-ourLady"
						textColorClass="text-lily"
					/>
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
