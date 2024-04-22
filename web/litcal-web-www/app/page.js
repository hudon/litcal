import { CalendarDaysIcon, LinkIcon } from "@heroicons/react/24/outline"
import Database from "better-sqlite3"
import Image from "next/image"
import DatePicker from "@/app/DatePicker"
import Button from "@/app/Button"

const teams = [
	{ id: 1, name: "Heroicons", href: "#", initial: "H", current: false },
	{ id: 2, name: "Tailwind Labs", href: "#", initial: "T", current: false },
	{ id: 3, name: "Workcation", href: "#", initial: "W", current: false },
]

function classNames(...classes) {
	return classes.filter(Boolean).join(" ")
}

function NavHolyDays() {
	const team = teams[0]
	return (
		<a
			href={team.href}
			className={classNames(
				team.current
					? "bg-indigo-700 text-white"
					: "text-stellaMarris hover:bg-indigo-700 hover:text-white",
				"group flex h-full flex-col justify-center px-12 leading-6",
			)}
		>
			<p className="flex  gap-x-4">
				<CalendarDaysIcon
					className="h-6 w-6 shrink-0 text-ashes"
					aria-hidden="true"
				/>
				<span className="truncate ">Holy Days of Obligation</span>
			</p>
		</a>
	)
}

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
		<div className="flex h-full bg-dove ">
			{/* Static sidebar for desktop */}
			<div className="flex w-96 flex-shrink-0 flex-col overflow-y-auto bg-lily ">
				<div className=" mt-5 h-28 flex-shrink-0 pl-10 pt-12">
					<Image
						src="/litcal.svg"
						alt="Litcal Logo"
						width={94}
						height={30}
						priority
					/>
				</div>
				<div className="h-100 w-full flex-shrink-0 shadow-y">
					<DatePicker></DatePicker>
				</div>
				<div className="mt-5 h-20 flex-shrink-0 bg-lily shadow-y">
					<NavHolyDays></NavHolyDays>
				</div>
				<div className="mb-16 flex flex-grow flex-col-reverse pl-10 pt-12">
					<a href="https://apps.apple.com/us/app/litcal-liturgical-calendar/id1641330305">
						<Image
							src="/appstore.svg"
							alt="Download on the App Store"
							className="hover:cursor-pointer"
							width={174}
							height={58}
							priority
						/>
					</a>
				</div>
			</div>

			<main
				className="flex min-h-full flex-shrink-0 flex-grow flex-col
				items-center
				 justify-center overflow-y-auto bg-dove px-8 text-stellaMarris"
			>
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
			</main>
		</div>
	)
}
