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
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

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

	// Generate schema files so that the user can see the final state of the database
	if err = generateSchemaFiles(migrationsDirPath, db); err != nil {
		log.Fatal(fmt.Errorf("generateSchemaFiles: %w", err))
	}

	log.Println("INFO: Schema files have been generated in the migrations directory.")
}

func findMigrations(migrationsDirPath string) (map[int]string, error) {
	// Find all SQL files and determine target version if it wasn't specified
	dirEntries, err := os.ReadDir(migrationsDirPath)
	if err != nil {
		return nil, fmt.Errorf("os.ReadDir: %w", err)
	}
	sqlFiles := make(map[int]string, len(dirEntries))
	highestVersion := -1
	for _, file := range dirEntries {
		if file.Type().IsRegular() {
			matches := fileNameRE.FindStringSubmatch(file.Name())
			if len(matches) < 2 {
				continue
			}
			version, err := strconv.Atoi(matches[1])
			if err != nil {
				return nil, fmt.Errorf("strconv.Atoi: %w", err)
			}
			if version > highestVersion {
				highestVersion = version
			}
			sqlFiles[version] = file.Name()
		}
	}
	return sqlFiles, nil
}

func backup(sqliteFilePath string) error {
	backupDir := filepath.Dir(sqliteFilePath)
	timestamp := time.Now().Format("20060102_150405")
	backupFileName := fmt.Sprintf("%s_%s.sqlite", filepath.Base(sqliteFilePath), timestamp)
	backupFilePath := filepath.Join(backupDir, backupFileName)

	// Copy the database file to the backup file
	srcFile, err := os.Open(sqliteFilePath)
	if err != nil {
		return fmt.Errorf("os.Open: %w", err)
	}
	defer srcFile.Close()
	// TODO: is this a vulnerability since the filepath is determined from user input?
	dstFile, err := os.Open(backupFilePath)
	if err != nil {
		return fmt.Errorf("os.Open: %w", err)
	}
	defer dstFile.Close()

	_, err = io.Copy(dstFile, srcFile)
	if err != nil {
		return err
	}

	log.Printf("INFO: database backed up to %s\n", backupFilePath)
	return nil
}

func migrate(migrationsDirPath string, targetVersion int, db *sql.DB) error {
	var currentVersion int

	var direction Direction
	var sqlFiles map[int]string // all the migration files
	var versionsToRun []int     // only the versions we will run, sorted

	// Compute which migrations need to be run and sort them in the right order
	{
		var err error
		sqlFiles, err = findMigrations(migrationsDirPath)
		if err != nil {
			return fmt.Errorf("findMigrations: %w", err)
		}
		if len(sqlFiles) == 0 {
			return fmt.Errorf("no SQL files found in %s", migrationsDirPath)
		}
		highestVersion := -1
		for highestVersion = range sqlFiles {
			break
		}
		for n := range sqlFiles {
			if n > highestVersion {
				highestVersion = n
			}
		}

		if targetVersion == -1 {
			targetVersion = highestVersion
		}

		// Get current version or create version table if it doesn't exist
		row := db.QueryRow("SELECT version FROM version")
		err = row.Scan(&currentVersion)
		// create the table if it doesn't exist
		if err != nil {
			_, err2 := db.Exec("create table version (version integer primary key); insert into version (version) values (0);")
			if err2 != nil {
				return fmt.Errorf("db.Exec: %w, %w", err, err2)
			}
			currentVersion = 0
		}

		// Get all the versions in order that they need to be run (ascending or descending depending on the direction)
		if targetVersion > currentVersion {
			direction = Up
			for i := currentVersion + 1; i <= targetVersion; i++ {
				versionsToRun = append(versionsToRun, i)
			}
		} else {
			direction = Down
			for i := currentVersion; i > targetVersion; i-- {
				versionsToRun = append(versionsToRun, i)
			}
		}

		log.Printf("INFO: current version is %d\n", currentVersion)

		if currentVersion == targetVersion {
			log.Printf("INFO: already at version %d\n", currentVersion)
			return nil
		}

		// Tell user what we're about to do before we do anything.
		var filesToRun []string
		for _, version := range versionsToRun {
			filesToRun = append(filesToRun, sqlFiles[version])
		}
		log.Println("INFO: migrating", direction, "to version", targetVersion, ". Executing: ", filesToRun)
	}

	// run the migration files
	fromVersion := currentVersion
	for _, toVersion := range versionsToRun {
		filePath := filepath.Join(migrationsDirPath, sqlFiles[toVersion])
		b, err := os.ReadFile(filePath)
		if err != nil {
			return fmt.Errorf("for %d os.ReadFile %s: %w", toVersion, filePath, err)
		}
		// Take the migration content line-by-line and take only the UP or DOWN section depending on the direction
		lines := strings.Split(string(b), "\n")
		isUpFound := false
		isDownFound := false
		for i, line := range lines {
			if strings.HasPrefix(line, "--UP") {
				isUpFound = true
			} else if strings.HasPrefix(line, "--DOWN") {
				isDownFound = true
				if direction == Up {
					lines = lines[1:i] // starts at 1 to skip the "--UP" comment
				} else {
					lines = lines[i+1:] // starts at i+1 to skip the "--DOWN" comment
				}
				break
			}
		}
		if !isUpFound || !isDownFound {
			return fmt.Errorf("migration %s mis-formatted. Format should be:--UP\\n<statements>\\n--DOWN\\n<statements>\\n", filePath)
		}
		migSQL := strings.Join(lines, "\n")
		// Start a transaction so that the migration and the version update are atomic
		tx, err := db.Begin()
		if err != nil {
			return fmt.Errorf("db.Begin: %w", err)
		}
		if _, err = tx.Exec(migSQL); err != nil {
			return fmt.Errorf("tx.Exec: %w", err)
		}
		if direction == Down {
			toVersion -= 1
		}
		versionSQL := "update version set version = $1 where version = $2;"
		if _, err = tx.Exec(versionSQL, toVersion, fromVersion); err != nil {
			return fmt.Errorf("tx.Exec: %w", err)
		}
		if err = tx.Commit(); err != nil {
			return fmt.Errorf("tx.Commit: %w", err)
		}
		log.Printf("INFO: migrated to version %d by executing:\n%s", toVersion, migSQL)
		fromVersion = toVersion
	}

	row := db.QueryRow("SELECT version FROM version")
	if err := row.Scan(&currentVersion); err != nil {
		return fmt.Errorf("db.QueryRow: %w", err)
	}
	log.Printf("INFO: Migration complete. Current version is now %d\n", currentVersion)
	return nil
}
