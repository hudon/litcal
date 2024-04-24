import Image from "next/image"
import DatePicker from "@/app/DatePicker"
import { CalendarDaysIcon } from "@heroicons/react/24/outline"
import { parseDateSegment } from "@/app/dates"
import { clsx } from "clsx"

export default function Layout({ params, children }) {
	const utcDateMillis = parseDateSegment(params.date)
	return (
		<>
			<nav className="flex w-96 flex-shrink-0 flex-col overflow-y-auto bg-lily ">
				<div className="h-28 flex-shrink-0 pl-10 pt-12">
					<Image
						src="/litcal.svg"
						alt="Litcal Logo"
						width={94}
						height={30}
						priority
					/>
				</div>
				<div className="h-100 w-full flex-shrink-0 shadow-y">
					<DatePicker utcDateMillis={utcDateMillis}></DatePicker>
				</div>
				<div className="mt-5 h-20 flex-shrink-0 bg-lily shadow-y">
					<a
						href="/holydays"
						className={clsx(
							"text-stellaMarris hover:bg-ourLady hover:text-lily ",
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
			</nav>
			<main className="h-full flex-shrink-0 flex-grow overflow-y-auto bg-dove">
				{children}
			</main>
		</>
	)
}
