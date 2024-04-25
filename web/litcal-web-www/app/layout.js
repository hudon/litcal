import "./globals.css"
import localFont from "next/font/local"
import Image from "next/image"
import DatePicker from "@/app/DatePicker"
import { Link } from "@/components/catalyst/link"
import { NavLinks } from "@/app/navlinks"

const euclid = localFont({
	src: "./EuclidSquare-Regular.ttf",
	variable: "--font-euclid-square",
	display: "swap",
})

const tiempos = localFont({
	src: "./TiemposHeadline-Medium.ttf",
	variable: "--font-tiempos",
	display: "swap",
})

export const metadata = {
	title: "Litcal",
	description: "Roman Catholic Liturgical Calendar",
}

export default function RootLayout({ children }) {
	return (
		<html lang="en" className="h-full bg-white">
			<body
				className={`flex h-full ${euclid.variable} ${tiempos.variable} font-sans`}
			>
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
						<DatePicker></DatePicker>
					</div>
					<div className="mt-5 h-20 flex-shrink-0 bg-lily ">
						<NavLinks />
					</div>
					<div className="mb-16 flex flex-grow flex-col-reverse pl-10 pt-12">
						<Link href="https://apps.apple.com/us/app/litcal-liturgical-calendar/id1641330305">
							<Image
								src="/appstore.svg"
								alt="Download on the App Store"
								className="hover:cursor-pointer"
								width={174}
								height={58}
								priority
							/>
						</Link>
					</div>
				</nav>
				<main className="h-full flex-shrink-0 flex-grow overflow-y-auto bg-dove">
					{children}
				</main>
			</body>
		</html>
	)
}
