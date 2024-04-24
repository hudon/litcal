import { LinkIcon } from "@heroicons/react/24/outline"
import Image from "next/image"

import { Button } from "@/components/Button"
import { parseDateSegment } from "@/app/dates"
import { fetchTodayCelebration } from "@/app/celebrations/db"

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
					<div>
						{dateTxt} • {cel.season}
					</div>
					<Button
					// bgColorClass="bg-ourLady"
					// textColorClass="text-lily"
					>
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
