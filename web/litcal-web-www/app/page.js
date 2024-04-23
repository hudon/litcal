import { redirect } from "next/navigation"

export default function Page() {
	function leftPad(n) {
		return ("" + n).padStart(2, "0")
	}
	const t = new Date()
	const s =
		"" + t.getFullYear() + leftPad(t.getMonth() + 1) + leftPad(t.getDate())
	redirect("/" + s)
}
