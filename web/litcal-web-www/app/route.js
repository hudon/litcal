import { redirect } from "next/navigation"
import { makeDateSegment } from "@/app/dates"

export async function GET() {
	redirect("/" + makeDateSegment(new Date()))
}
