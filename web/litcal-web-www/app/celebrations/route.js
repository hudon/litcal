import { parseDateSegment } from "@/app/dates"
import { fetchCelebrations } from "@/app/celebrations/db"

export function GET(request) {
	const searchParams = request.nextUrl.searchParams
	const fromDate = parseDateSegment(searchParams.get("from"))
	const toDate = parseDateSegment(searchParams.get("to"))
	return Response.json({
		celebrations: fetchCelebrations(fromDate, toDate),
	})
}
