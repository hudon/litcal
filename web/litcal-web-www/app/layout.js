import "./globals.css"
import localFont from "next/font/local"

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
				className={`h-full ${euclid.variable} ${tiempos.variable} font-sans`}
			>
				{children}
			</body>
		</html>
	)
}
