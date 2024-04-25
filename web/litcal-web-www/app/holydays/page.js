import { ChevronRightIcon } from "@heroicons/react/24/outline"
import { Link } from "@/components/catalyst/link"

const holyDays = [
	[
		2024,
		[
			["Aug 15", "The Assumption of the Blessed Virgin Mary", "/20240915"],
			["Nov 1", "All Saints", "/20241101"],
			["Dec 25", "The Nativity of Our Lord", "/20241225"],
		],
	],
]

export default function Page() {
	return (
		<div className="flex flex-col items-center pt-32">
			{holyDays.map((year, i) => (
				<section key={i} className="w-full px-20">
					<h2 className="pl-5 text-ashes">{year[0]}</h2>
					<dl>
						{year[1].map((day, j) => (
							// TODO: animation of the holyday nav
							<Link
								key={j}
								href={day[2]}
								className=" my-2.5 flex min-h-14 items-stretch rounded-lg bg-lily py-1.5 hover:bg-lily/50"
							>
								<dt className=" flex w-24 items-center border-r-[0.5px] border-ashes pl-5 ">
									{day[0]}
								</dt>
								<dd className="flex flex-grow items-center justify-between px-6">
									<p>{day[1]}</p>
									<ChevronRightIcon
										className="ml-6 h-6 w-4 text-stellaMarris"
										aria-hidden="true"
										strokeWidth="2"
									/>
								</dd>
							</Link>
						))}
					</dl>
				</section>
			))}
		</div>
	)
}
