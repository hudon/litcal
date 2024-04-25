"use client"
import { clsx } from "clsx"
import { CalendarDaysIcon } from "@heroicons/react/24/outline"
import { Link } from "@/components/catalyst/link"
import { usePathname } from "next/navigation"

const holyDaysPath = "/holydays"

export function NavLinks() {
	const pathname = usePathname()
	console.log("pathname", pathname)
	return (
		<Link
			href={holyDaysPath}
			className={clsx(
				pathname === holyDaysPath
					? "border-l-[6px] border-ourLady bg-ourLady/10 pl-[calc(theme(spacing.12)-6px)] after:right-[100%]"
					: "pl-12 shadow-y after:right-0 hover:text-lily",
				"relative after:absolute after:bottom-0 after:left-0  after:top-0 after:bg-transparent after:hover:bg-ourLady",
				"after:transition-[right] after:ease-in-out",
				"group flex h-full flex-col justify-center pr-12 leading-6 text-stellaMarris",
			)}
		>
			<p className="z-20  flex gap-x-4">
				<CalendarDaysIcon
					className={clsx(
						pathname === holyDaysPath ? "text-ourLady" : " text-ashes",
						"h-6 w-6 shrink-0",
					)}
					aria-hidden="true"
				/>
				<span className="truncate ">Holy Days of Obligation</span>
			</p>
		</Link>
	)
}
