import {
	CalendarDaysIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	BookmarkIcon,
	LinkIcon,
} from "@heroicons/react/24/outline"
import { Database } from "sqlite3"
import Image from "next/image"

const teams = [
	{ id: 1, name: "Heroicons", href: "#", initial: "H", current: false },
	{ id: 2, name: "Tailwind Labs", href: "#", initial: "T", current: false },
	{ id: 3, name: "Workcation", href: "#", initial: "W", current: false },
]

function classNames(...classes) {
	return classes.filter(Boolean).join(" ")
}

/**
 * Retrieves the days of the month
 * @return {Array<Array<Date|null>>} -  There will be 'null' for the initial days from
 * Sunday to the first day of the month. Then the elements are the dates from the first
 * to the last day of the month. Each sub-array is a Sunday-to-Saturday week.
 */
function getMonthDays() {
	const currDate = new Date()
	const currMonth = currDate.getMonth()
	const currYear = currDate.getFullYear()
	const startOfMonth = new Date(currYear, currMonth, 1)
	const endOfMonth = new Date(currYear, currMonth + 1, 0)
	const lastDayOfMonth = endOfMonth.getDate()
	let monthDays = [[]]
	for (let i = 0; i < startOfMonth.getDay(); i++) {
		monthDays[0].push(null)
	}
	monthDays[0].push(startOfMonth)
	for (let i = 2; i <= lastDayOfMonth; i++) {
		const currRow = monthDays[monthDays.length - 1]
		const prevDay = currRow[currRow.length - 1]
		const newDay = new Date(currYear, currMonth, i)
		if (prevDay.getDay() === 6) {
			monthDays.push([newDay])
		} else {
			currRow.push(newDay)
		}
	}
	return monthDays
}

/**
 * A button component
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {React.ReactSVGElement} props.Icon
 * @param {string} [props.bgColorClass]
 * @param {string} [props.textColorClass]
 * @returns {React.Element}
 */
function Button({
	label,
	Icon,
	bgColorClass = "bg-dove",
	textColorClass = "text-ashes",
}) {
	return (
		<div
			className={`flex flex-row rounded-md px-3 py-1.5 
			${bgColorClass} ${textColorClass} hover:cursor-pointer`}
		>
			<Icon className="h- w-4" aria-hidden="true" strokeWidth="2" />
			<span className="pl-2 text-xs">{label}</span>
		</div>
	)
}

function DatePicker() {
	return (
		<div className="px-10 py-8">
			<div className="flex flex-col gap-y-2 text-stellaMarris">
				<div className="flex flex-row justify-between pb-2">
					<div className="flex flex-row gap-x-4">
						<span>June 2020</span>
						<ChevronLeftIcon
							className="h-6 w-4 text-ashes"
							aria-hidden="true"
							strokeWidth="2"
						/>
						<ChevronRightIcon
							className="h-6 w-4 text-ashes"
							aria-hidden="true"
							strokeWidth="2"
						/>
					</div>
					<Button label="TODAY" Icon={BookmarkIcon} />
				</div>
				<table>
					<thead>
						<tr className="text-sm font-light text-ashes">
							{["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
								(val, i) => (
									<th key={i} className="py-2 font-light">
										{val}
									</th>
								),
							)}
						</tr>
					</thead>
					<tbody>
						{getMonthDays().map((week, weekIdx) => (
							<tr key={weekIdx}>
								{week.map((day, dayIdx) => (
									<td key={dayIdx} className="py-3 text-center">
										{day?.getDate()}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
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

function fetchCelebrations() {
	// this is pulled from litdb... use litdb if logic needs to be shared
	const db = new Database("../../litcal.sqlite")
	const queryStr =
		"SELECT lc.event_key, lc.rank, lc.title, lc.subtitle, lc.gospel, " +
		"lc.gospel_ref, lc.readings_url, lcol.name AS color, ls.name, " +
		"ld.secular_date_s, COUNT(*) OVER () " +
		"FROM lit_celebration lc " +
		"JOIN lit_day ld ON lc.lit_day_id = ld.id " +
		"JOIN lit_color lcol ON lc.lit_color_id = lcol.id " +
		"JOIN lit_season ls ON ld.lit_season_id = ls.id " +
		"JOIN lit_year ly ON ls.lit_year_id = ly.id " +
		"WHERE ld.secular_date_s >= ? AND ld.secular_date_s <= ? AND ly.lit_calendar_id = ? " +
		"ORDER BY ld.secular_date_s;"
	db.each(
		queryStr,
		1704931200,
		1704931200 + 3 * 24 * 60 * 60,
		1,
		(err, row) => {
			console.log(row.secular_date_s + ": " + row.title)
		},
	)
	db.close()
}

export default function Page() {
	fetchCelebrations()
	// originally based off of this template
	// https://tailwindui.com/components/application-ui/application-shells/sidebar#component-a69d85b6237ea2ad506c00ef1cd39a38
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
					Saint Lawrence of Brindisi
				</h1>
				<h2 className="mb-3.5 min-h-10 flex-shrink-0 text-ashes">
					Priest and Doctor of the Church
				</h2>
				<h3 className="mb-1 min-h-10 flex-shrink-0">Gospel</h3>
				<p className="w-[537px] leading-7">
					On another occasion, Jesus began to teach by the sea. A very large
					crowd gathered around him so that he got into a boat on the sea and
					sat down. And the whole crowd was beside the sea on land. And he
					taught them at length in parables, and in the course of his
					instruction he said to them, &quot;Hear this! A sower went out to sow.
					And as he sowed, some seed fell on the path, and the birds came and
					ate it up. Other seed fell on rocky ground where it had little soil.
					It sprang up at once because the soil was not deep. And when the sun
					rose, it was scorched and it withered for lack of roots. Some seed
					fell among thorns, and the thorns grew up and choked it and it
					produced no grain. And some seed fell on rich soil and produced fruit.
					It came up and grew and yielded thirty, sixty, and a
					hundredfold.&quot; He added, &quot;Whoever has ears to hear ought to
					hear.&quot; And when he was alone, those present along with the Twelve
					questioned him about the parables. Jesus said to them, &quot;Do you
					not understand this parable? Then how will you understand any of the
					parables? The sower sows the word. These are the ones on the path
					where the word is sown. As soon as they hear, Satan comes at once and
					takes away the word sown in them. And these are the ones sown on rocky
					ground who, when they hear the word, receive it at once with joy. But
					they have no roots; they last only for a time. Then when tribulation
					or persecution comes because of the word, they quickly fall away.
					Those sown among thorns are another sort. They are the people who hear
					the word, but worldly anxiety, the lure of riches, and the craving for
					other things intrude and choke the word, and it bears no fruit. But
					those sown on rich soil are the ones who hear the word and accept it
					and bear fruit thirty and sixty and a hundredfold.&quot;
				</p>
			</main>
		</div>
	)
}
