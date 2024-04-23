import { redirect } from "next/navigation"
import { makeDatePath } from "@/app/dates"

export async function GET() {
	redirect("/" + makeDatePath(new Date()))
}
