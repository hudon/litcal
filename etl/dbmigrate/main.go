// dbmigrate is a database migration tool
//
// Usage:
//
//	dbmigrate [path/to/database.sqlite] [path/to/migrations] [target_version] [second_target_version]
//
// The second target will be migrated to after a successful migration to the first target.
// This can be used to re-run a migration after it has been modified.
package main

import (
	"database/sql"
	"log"
	"os"
	"regexp"
	"strconv"

	_ "github.com/mattn/go-sqlite3"
)

const (
	Up   Direction = "up"
	Down Direction = "down"
)

var fileNameRE = regexp.MustCompile(`^(\d+).sql$`)

type Direction string

// NOTE: if you modify me to support non-SQLite, please keep SQLite support as an option so I can make dbmigrate better.
func main() {
	// Parse command line arguments
	if len(os.Args) < 2 {
		log.Fatal("SQLite file path argument is required")
	}
	sqliteFilePath := os.Args[1]

	targetVersion := -1
	secondTargetVersion := -1
	migrationsDirPath, err := os.Getwd()
	if err != nil {
		log.Fatalf("os.Getwd: %v", err)
	}
	// If the second argument is missing, assume we are in the migrations directory and we are migrating all the way up
	if len(os.Args) > 2 {
		migrationsDirPath = os.Args[2]
	}
	if len(os.Args) > 3 {
		targetVersion, err = strconv.Atoi(os.Args[3])
		if err != nil {
			log.Fatalf("strconv.Atoi: %v", err)
		}
		if targetVersion < 0 {
			log.Fatalf("Invalid target version: %d", targetVersion)
		}
	}
	// A second target version allows the user to run in two directions, such as going down and
	// then up to re-run a modified migration
	if len(os.Args) > 4 {
		secondTargetVersion, err = strconv.Atoi(os.Args[4])
		if err != nil {
			log.Fatalf("strconv.Atoi: %v", err)
		}
		if secondTargetVersion < 0 {
			log.Fatalf("Invalid second target version: %d", secondTargetVersion)
		}
	}

	db, err := sql.Open("sqlite3", sqliteFilePath)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Being ready to migrate, we need to first backup the database
	err = backup(sqliteFilePath)
	if err != nil {
		log.Fatal(err)
	}

	// migrate, then migrate again only if a second target version was specified
	err = migrate(migrationsDirPath, targetVersion, db)
	if err != nil {
		log.Fatal(err)
	}
	if secondTargetVersion != -1 {
		err = migrate(migrationsDirPath, secondTargetVersion, db)
		if err != nil {
			log.Fatal(err)
		}
	}

	// disabling this instead of making it available to SQLite for now.
	// Generate schema files so that the user can see the final state of the database
	//if err = generateSchemaFiles(migrationsDirPath, db); err != nil {
	//log.Fatal(fmt.Errorf("generateSchemaFiles: %w", err))
	//}

	log.Println("INFO: Schema files have been generated in the migrations directory.")
}
