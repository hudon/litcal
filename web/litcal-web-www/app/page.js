import {Fragment} from 'react'
import {CalendarIcon,} from '@heroicons/react/24/outline'
import {Database} from 'sqlite3'
import Image from "next/image"

const teams = [
	{ id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
	{ id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
	{ id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
]

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

function DatePicker() {
	return <div className="h-100 w-full shadow-y px-10 py-8">
		<p>Date Picker</p>
		<div className="flex flex-col">
			<div className="flex flex-row justify-between">
				<div className="flex flex-row gap-x-4">
					<span>June 2020</span>
					<span>{"<"}</span>
					<span>{">"}</span>
				</div>
				<div className="flex flex-row">
					<span>c</span>
					<span>Today</span>
				</div>
			</div>
			<table>
				<thead>
				<tr>
					<th>SUN</th>
					<th>MON</th>
					<th>TUE</th>
					<th>WED</th>
					<th>THU</th>
					<th>FRI</th>
					<th>SAT</th>
				</tr>
				</thead>
				<tbody>
				<tr>
					<td>&nbsp;</td>
					<td>1</td>
					<td>2</td>
					<td>3</td>
					<td>4</td>
					<td>5</td>
					<td>6</td>
				</tr>
				<tr>
					<td>&nbsp;</td>
					<td>1</td>
					<td>2</td>
					<td>3</td>
					<td>4</td>
					<td>5</td>
					<td>6</td>
				</tr>
				<tr>
					<td>&nbsp;</td>
					<td>1</td>
					<td>2</td>
					<td>3</td>
					<td>4</td>
					<td>5</td>
					<td>6</td>
				</tr>
				<tr>
					<td>&nbsp;</td>
					<td>1</td>
					<td>2</td>
					<td>3</td>
					<td>4</td>
					<td>5</td>
					<td>6</td>
				</tr>
				<tr>
					<td>&nbsp;</td>
					<td>1</td>
					<td>2</td>
					<td>3</td>
					<td>4</td>
					<td>5</td>
					<td>6</td>
				</tr>
				</tbody>
			</table>
		</div>
	</div>
}

function NavHolyDays() {
	const team = teams[0];
	return <div>
		<a
			href={team.href}
			className={classNames(
				team.current
					? 'bg-indigo-700 text-white'
					: 'text-indigo-200 hover:text-white hover:bg-indigo-700',
				'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
			)}
		>
			<CalendarIcon
				className='text-white h-6 w-6 shrink-0'
				aria-hidden="true"
			/>
			<span className="truncate">Holy Days of obligation</span>
		</a>
	</div>
}

function NavFooter() {
	return <a
		href="#"
		className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-indigo-700"
	>
		<span className="sr-only">Download on the App Store</span>
		<span aria-hidden="true">Download on the App Store</span>
	</a>
}

// TODO document me
function fetchCelebrations() {
	// this is pulled from litdb... use litdb if logic needs to be shared
	const db = new Database('../../litcal.sqlite')
	const queryStr = "SELECT lc.event_key, lc.rank, lc.title, lc.subtitle, lc.gospel, " +
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
		1704931200, 1704931200 + 3 * 24 * 60 * 60, 1,
		(err, row) => {
			console.log(row.secular_date_s + ": " + row.title)
		});
	db.close()
}

export default function Page() {
	fetchCelebrations()
	// originally based off of this template
	// https://tailwindui.com/components/application-ui/application-shells/sidebar#component-a69d85b6237ea2ad506c00ef1cd39a38
	return (
		<>
			<div className="">
				{/* Static sidebar for desktop */}
				<div className="bg-lily fixed inset-y-0 z-50 w-96 ">
					<div>
						<div className=" h-28 pl-10 pt-12">
							<Image
								src="/litcal.svg"
								alt="Litcal Logo"
								className="dark:invert"
								width={94}
								height={30}
								priority
							/>
						</div>
						<DatePicker></DatePicker>
						<NavHolyDays></NavHolyDays>
						<NavFooter></NavFooter>
					</div>
				</div>

				<main className="py-10 pl-72">
					<div className="px-8">{/* Your content */}</div>
				</main>
			</div>
		</>
	)
}
