"use client"

import { useState } from "react"
import {
	BookmarkIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "@heroicons/react/24/outline"
import { Button } from "@/components/button"
import { isSameUTCDate, makeDatePath } from "@/app/dates"

/**
 * Retrieves the days of the month
 *
 * @param {number} year
 * @param {number} month - month to get dates for
 * @return {Array<Array<Date|null>>} -  There will be 'null' for the initial days from
 * Sunday to the first day of the month. Then the elements are the dates from the first
 * to the last day of the month. Each sub-array is a Sunday-to-Saturday week.
 */
function makeMonthDates(year, month) {
	const startOfMonth = new Date(year, month, 1)
	const endOfMonth = new Date(year, month + 1, 0)
	const lastDayOfMonth = endOfMonth.getDate()
	let monthDays = [[]]
	for (let i = 0; i < startOfMonth.getDay(); i++) {
		monthDays[0].push(null)
	}
	monthDays[0].push(startOfMonth)
	for (let i = 2; i <= lastDayOfMonth; i++) {
		/** @type {Array<Date>} */
		const currRow = monthDays[monthDays.length - 1]
		const prev = currRow[currRow.length - 1]
		const next = new Date(year, month, i)
		if (prev.getDay() === 6) {
			monthDays.push([next])
		} else {
			currRow.push(next)
		}
	}
	return monthDays
}

/**
 *
 * @param currDate
 * @return {JSX.Element}
 * @constructor
 */
export default function DatePicker({ utcDateMillis }) {
	const utcDate = new Date(utcDateMillis)
	// we need the UTC variants, otherwise a Jan 1 2024 date will return 2023 in
	// PDT because of the -7 timezone offset
	const year = utcDate.getUTCFullYear()
	const [month, setMonth] = useState(utcDate.getUTCMonth())
	return (
		<div className="px-10 py-8">
			<div className="flex flex-col gap-y-2 text-stellaMarris">
				<div className="flex flex-row items-center justify-between pb-2">
					<span>
						{new Date(year, month, 1).toLocaleString("default", {
							month: "long",
							year: "numeric",
							timeZone: "UTC",
						})}
					</span>
					<div className="flex flex-row gap-x-4">
						<button type="button">
							<ChevronLeftIcon
								className="no-s h-6 w-4 text-ashes"
								aria-hidden="true"
								strokeWidth="2"
								onClick={() => setMonth(month - 1)}
							/>
						</button>
						<button type="button">
							<ChevronRightIcon
								className="h-6 w-4 text-ashes"
								aria-hidden="true"
								strokeWidth="2"
								onClick={() => setMonth(month + 1)}
							/>
						</button>
						<Button href={makeDatePath(new Date())} color="dove">
							<BookmarkIcon />
							TODAY
						</Button>
					</div>
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
						{makeMonthDates(year, month).map((week, weekIdx) => (
							<tr key={"" + month + weekIdx}>
								{week.map((day, dayIdx) => (
									<td key={dayIdx} className=" py-2 text-center ">
										<div
											className={
												"m-auto h-8 w-8 pt-1 " +
												(isSameUTCDate(day, utcDate) &&
													"rounded-full bg-stellaMarris  text-lily")
											}
										>
											<a
												href={makeDatePath(day)}
												className=" hover:cursor-pointer"
											>
												{day?.getDate()}
											</a>
										</div>
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
