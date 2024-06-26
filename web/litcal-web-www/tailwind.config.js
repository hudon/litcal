const defaultTheme = require("tailwindcss/defaultTheme")
/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-euclid-square)", ...defaultTheme.fontFamily.sans],
				serif: ["var(--font-tiempos)", ...defaultTheme.fontFamily.serif],
			},
			boxShadow: {
				y: "0 4px 40px rgba(218, 218, 218, 0.60)",
			},
			height: {
				100: "25rem",
			},
			colors: {
				ashes: "#B3B3B3",
				dove: "#F0F0F0",
				figTree: "#2FB144",
				lily: "#FFFFFF",
				matrimony: "#F1A9A0",
				ourLady: "#3399FF",
				passion: "#EB5526",
				stellaMarris: "#010023",
				wine: "#AF52DE",
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
			},
		},
	},
	plugins: [],
}
