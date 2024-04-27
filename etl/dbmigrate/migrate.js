import fs from "fs"

export default function migrate(db, path, target) {
	const files = fs.readdirSync(path)
	console.log("files", files)
}
