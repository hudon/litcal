import process from "node:process"
import Database from "better-sqlite3"
import backup from "./backup.js"
import migrate from "./migrate.js"

function fatal(s) {
	console.error(s)
	process.exit(1)
}

/**
 *
 * @param {Array<string>} a
 * @return {[Database, string, number, number]}
 */
function parseArgs(a) {
	let argv = a.slice(1)
	if (argv.length < 2) {
		fatal("SQLite file path argument is required")
	}

	const sqlitePath = process.argv[1]

	const db = new Database(sqlitePath, {
		fileMustExist: true,
	})

	process.on("exit", () => db.close())
	process.on("SIGHUP", () => process.exit(128 + 1))
	process.on("SIGINT", () => process.exit(128 + 2))
	process.on("SIGTERM", () => process.exit(128 + 15))

	let targetVersion = null,
		secondTarget = null,
		migrationsPath = process.cwd()

	if (argv.length > 2) {
		migrationsPath = process.argv[2]
	}
	if (argv.length > 3) {
		targetVersion = parseInt(process.argv[2])
		if (targetVersion < 0) {
			fatal("Invalid target version")
		}
	}
	if (argv.length > 4) {
		secondTarget = parseInt(process.argv[3])
		if (secondTarget < 0) {
			fatal("Invalid second target version")
		}
	}
	return [db, migrationsPath, targetVersion, secondTarget]
}

export default function main() {
	try {
		let [db, migPath, t1, t2] = parseArgs(process.argv)
		backup(migPath)
		migrate(db, migPath, t1)
		if (t2 !== null) migrate(db, migPath, t2)
	} catch (error) {
		fatal(error.message)
	}
}
