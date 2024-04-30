import fs from "fs"
import path from "node:path"

const directions = {
	UP: "UP",
	DOWN: "DOWN",
}

/**
 *
 * @param db
 * @param {string} migPath
 * @param {number} target
 */
export default function migrate(db, migPath, target) {
	const fileNameRE = /^(\d+).sql$/
	const versions = fs
		.readdirSync(migPath, {
			withFileTypes: true,
		})
		.filter((dirent) => dirent.isFile())
		.map((dirent) => dirent.name.match(fileNameRE))
		.filter(Boolean)
		.map((m) => parseInt(m[1]))

	if (versions.length < 1) {
		throw new Error(`no SQL files found in ${migPath}`)
	}

	const sqlFiles = {}
	for (const version of versions) {
		sqlFiles[version] = `${version}.sql`
	}

	const highestV = Math.max(...versions)

	if (target === null) {
		target = highestV
	}

	// console.log("files", versions, highestV, sqlFiles)
	let currVersion = 0
	try {
		currVersion = db.prepare("SELECT version FROM version").get().version
	} catch (e) {
		db.prepare("CREATE TABLE version (version INTEGER)").run()
		db.prepare("INSERT INTO version (version) VALUES (0)").run()
	}

	console.log(`INFO: current version is ${currVersion}`)
	if (currVersion === target) {
		console.log(`INFO: already at version ${currVersion}, aborting migration`)
		return
	}

	let dir = directions.UP
	const versionsToRun = []
	if (currVersion < target) {
		for (let i = currVersion + 1; i <= target; i++) {
			versionsToRun.push(i)
		}
	} else {
		dir = directions.DOWN
		for (let i = currVersion; i > target; i--) {
			versionsToRun.push(i)
		}
	}

	const filesToRun = versionsToRun.map((v) => sqlFiles[v]).filter(Boolean)

	if (filesToRun.length === 0) {
		console.log(
			`INFO: no migration files found to go from ${currVersion} to ${target}, aborting.`,
		)
		return
	}

	console.log(
		`INFO: migrating ${dir} to version ${target}. Executing: ${filesToRun}`,
	)

	let fromV = currVersion
	for (let toV of versionsToRun) {
		const filePath = path.join(migPath, sqlFiles[toV])
		const fileContent = fs.readFileSync(filePath, "utf8")
		let lines = fileContent.split("\n")
		let isUpFound = false,
			downIndex = null,
			i = 0
		for (const line of lines) {
			if (line.trim().match(/^-- ?UP/)) {
				isUpFound = true
			} else if (line.trim().match(/^-- ?DOWN/)) {
				downIndex = i
				break
			}
			i++
		}
		if (downIndex === null || !isUpFound) {
			throw new Error(
				`migration ${filePath} mis-formatted. Format should be:--UP\\n<statements>\\n--DOWN\\n<statements>\\n`,
			)
		}
		const migSQL = (
			dir === directions.UP
				? lines.slice(1, downIndex)
				: lines.slice(downIndex + 1)
		).join("\n")

		db.transaction((migSQL) => {
			db.exec(migSQL)
			if (dir === directions.DOWN) {
				toV--
			}
			db.prepare("UPDATE version SET version = ? WHERE version = ?").run(
				toV,
				fromV,
			)
		})(migSQL)
		console.log(`INFO: migrated to version ${toV} by executing:\n${migSQL}`)
		fromV = toV
	}
	const currV = db.prepare("SELECT version FROM version").pluck().get()
	console.log(`INFO: Migration complete. Current version is now ${currV}`)
}
