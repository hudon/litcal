"use client"

import { useCallback, useEffect, useState } from "react"
import {
	BookmarkIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "@heroicons/react/24/outline"
import { Button } from "@/components/Button"
import {
	localDateToEpochMillis,
	makeDateSegment,
	parseDateSegment,
	todayAsEpochMillis,
	isDateEqualToEpochMillis,
} from "@/app/dates"
import { clsx } from "clsx"
import { usePathname } from "next/navigation"

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
 * Returns the class to be used on the calendar date for the given celebration
 * @param {LitCelebration} [cel]
 * @return {string}
 */
function colorClassForCelebration(cel) {
	if (!cel || cel.rank > 11) return ""

	switch (cel.color) {
		case "red":
			return "bg-passion"
		case "green":
			return "bg-figTree"
		case "violet":
			return "bg-wine"
		case "rose":
			return "bg-matrimony"
		case "white":
			return "border"
	}

	return ""
}

/**
 *
 * @return {JSX.Element}
 * @constructor
 */
export default function DatePicker() {
	// "selection" means the selected date, "active" means the date representing the
	// month that is currently shown. You can select March 25 but the user navigated to January,
	// for example
	// Both these dates are in milliseconds from epoch to 00:00 UTC
	const [selectionMS, setSelectionMS] = useState(null),
		[activeMonthMS, setActiveMonthMS] = useState(todayAsEpochMillis()),
		activeMonthDate = new Date(activeMonthMS),
		[celebrations, setCelebrations] = useState({})

	const currPathname = usePathname()
	try {
		// TODO: investigate why month is changed when navigating to holydays... also are rerenders still an issue?
		const pathEpochMS = parseDateSegment(currPathname.split("/")[1])
		if (pathEpochMS !== selectionMS) {
			// If the selection no longer matches the path (bc the user navigated to a different path),
			// the selection is updated, and the month is made active (ie. it is shown)
			setSelectionMS(pathEpochMS)
			setActiveMonthMS(pathEpochMS)
		}
	} catch (e) {}

	const addToMonth = useCallback(
		(n) => {
			const a = new Date(activeMonthMS)
			setActiveMonthMS(
				Date.UTC(a.getUTCFullYear(), a.getUTCMonth() + n, a.getUTCDate()),
			)
		},
		[activeMonthMS],
	)

	const today = new Date(),
		// UTC variants are used because these are "epoch dates"
		year = activeMonthDate.getUTCFullYear(),
		month = activeMonthDate.getUTCMonth(),
		monthDates = makeMonthDates(year, month),
		firstDate = monthDates[0].find(Boolean),
		lastDate = monthDates[monthDates.length - 1].findLast(Boolean),
		// These are stable and prevent a re-render loop caused by firstDate re-computing
		// to a different Date object that represents the same date
		firstDateAsSegment = makeDateSegment(firstDate),
		lastDateAsSegment = makeDateSegment(lastDate)

	useEffect(() => {
		let ignore = false
		// TODO: handle error
		fetch(`/celebrations?from=${firstDateAsSegment}&to=${lastDateAsSegment}`)
			.then((res) => {
				if (ignore) return
				res.json().then((data) => {
					if (ignore) return
					const celebrations = {}
					for (const cel of data.celebrations) {
						celebrations[cel.dateSeconds] = cel
					}
					setCelebrations(celebrations)
				})
			})
			.catch((err) => {})
		return () => {
			ignore = true
		}
	}, [firstDateAsSegment, lastDateAsSegment])

	return (
		<div className="px-10 py-8">
			<div className="flex flex-col gap-y-2 text-stellaMarris">
				<div className="flex flex-row items-center justify-between pb-2">
					<span>
						{activeMonthDate.toLocaleString("default", {
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
								onClick={() => addToMonth(-1)}
							/>
						</button>
						<button type="button">
							<ChevronRightIcon
								className="h-6 w-4 text-ashes"
								aria-hidden="true"
								strokeWidth="2"
								onClick={() => addToMonth(1)}
							/>
						</button>
						<Button
							href={"/" + makeDateSegment(new Date())}
							color="dove"
							onClick={() => setActiveMonthMS(localDateToEpochMillis(today))}
						>
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
						{monthDates.map((week, weekIdx) => (
							<tr key={"" + month + weekIdx}>
								{week.map((day, dayIdx) => (
									<td
										key={dayIdx}
										className=" relative pb-2 pt-1.5 text-center"
									>
										<div
											className={clsx(
												"m-auto h-8 w-8 pt-1",
												isDateEqualToEpochMillis(day, selectionMS) &&
													"rounded-full bg-stellaMarris text-lily",
											)}
										>
											<a
												href={"/" + makeDateSegment(day)}
												className=" hover:cursor-pointer"
											>
												{day?.getDate()}
											</a>
										</div>
										<p
											className={clsx(
												"absolute bottom-0.5 left-[42%] mx-auto h-1.5 w-1.5 rounded-full ",
												day &&
													!isDateEqualToEpochMillis(day, selectionMS) &&
													colorClassForCelebration(
														celebrations[localDateToEpochMillis(day) / 1000],
													),
											)}
										>
											&nbsp;
										</p>
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
