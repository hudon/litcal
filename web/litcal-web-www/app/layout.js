import "./globals.css"
import localFont from "next/font/local"

const euclid = localFont({
	src: "./EuclidSquare-Regular.ttf",
	variable: "--font-euclid-square",
})

export const metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
}

export default function RootLayout({ children }) {
	return (
		<html lang="en" className="h-full bg-white">
			<body className={`h-full ${euclid.variable} font-sans`}>{children}</body>
		</html>
	)
}
