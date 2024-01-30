/*
 * Copyright (c) 2023. James Hudon
 */

package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

var funcDefRE = regexp.MustCompile(`(?ims)^create (?:or replace )?function\s+(\w+).+?\$\$.+?\$\$.*?;`)
var funcRenameRE = regexp.MustCompile(`(?ims)^alter function\s+(\w+).+?rename to (\w+).*?;`)
var viewDefRE = regexp.MustCompile(`(?ims)^create (?:or replace )?view\s+(\w+) as.+?;`)
var viewRenameRE = regexp.MustCompile(`(?ims)^alter view\s+(\w+).+?rename to (\w+).*?;`)

// represents one version of a db object
type iteration struct {
	version        int
	bodyStartIndex int
	body           string
	renameFrom     string // unused for definitions (only used for renames)
}

// is a container type holding many definitions and renames of a given db object
type defTracker struct {
	defs     []iteration
	renameTo []iteration
}

type dbObject struct {
	name    string
	tracker defTracker
}

func initIfNotExists(objects map[string]*dbObject, name string) {
	if _, ok := objects[name]; !ok {
		objects[name] = &dbObject{
			name:    name,
			tracker: defTracker{},
		}
	}
}

func sortIterations(iters []iteration) {
	sort.Slice(iters, func(i, j int) bool {
		if iters[i].version == iters[j].version {
			return iters[i].bodyStartIndex < iters[j].bodyStartIndex
		}
		return iters[i].version < iters[j].version
	})
}

func getLastIteration(objects map[string]*dbObject, name string) (iteration, error) {
	if _, ok := objects[name]; !ok {
		return iteration{}, fmt.Errorf("routine %s not found", name)
	}
	defs := objects[name].tracker.defs
	renames := objects[name].tracker.renameTo
	allIterations := append(defs, renames...)
	sortIterations(allIterations)
	return allIterations[len(allIterations)-1], nil
}

func addObjectDefs(objects map[string]*dbObject, migStr string, version int, re *regexp.Regexp) error {
	downIndex := strings.Index(migStr, "--DOWN")
	viewDefMatches := re.FindAllStringSubmatchIndex(migStr, -1)
	for _, match := range viewDefMatches {
		if len(match) != 4 {
			return fmt.Errorf("unexpected number of submatches for obj definition regex: %d. Migration: %d",
				len(match), version)
		}

		rName := migStr[match[2]:match[3]]
		rBody := migStr[match[0]:match[1]]

		initIfNotExists(objects, rName)

		if match[0] > downIndex {
			continue
		}
		objects[rName].tracker.defs = append(
			objects[rName].tracker.defs,
			iteration{version: version, bodyStartIndex: match[0], body: rBody})
	}
	return nil
}

func addObjectRenames(objects map[string]*dbObject, migStr string, version int, re *regexp.Regexp) error {
	downIndex := strings.Index(migStr, "--DOWN")
	renameMatches := re.FindAllStringSubmatchIndex(migStr, -1)
	for _, match := range renameMatches {
		if len(match) != 6 {
			return fmt.Errorf("unexpected number of submatches for obj rename regex: %d. Migration: %d",
				len(match), version)
		}
		oldName := migStr[match[2]:match[3]]
		newName := migStr[match[4]:match[5]]

		initIfNotExists(objects, oldName)
		initIfNotExists(objects, newName)

		if match[0] > downIndex {
			continue
		}

		objects[newName].tracker.renameTo = append(
			objects[newName].tracker.renameTo,
			iteration{
				version,
				match[0],
				migStr[match[0]:match[1]],
				oldName,
			})
	}
	return nil
}

func makeHistories(objects map[string]*dbObject, nameRows *sql.Rows) (map[string][]iteration, error) {
	objectHistories := make(map[string][]iteration)
	for nameRows.Next() {
		var rName string
		if err := nameRows.Scan(&rName); err != nil {
			return nil, fmt.Errorf("rows.Scan: %w", err)
		}

		// trail from the last definition to the last rename
		var canonicalHistory []iteration

		lastIteration, err := getLastIteration(objects, rName)
		if err != nil {
			log.Printf("Failed to find an iteration for object %s, err: %v\n", rName, err)
			continue
		}
		if lastIteration.renameFrom == "" {
			// last iter is not a rename, so the last definition is therefore a canonical definition
			canonicalHistory = []iteration{lastIteration}
			objectHistories[rName] = canonicalHistory
			continue
		}

		canonicalHistory = append(canonicalHistory, lastIteration)

		// last iteration is a rename, so we search backwards for the canonical definition
		newName := lastIteration.renameFrom
		i := 0
		for ; i < 10; i++ {
			lastIteration, err := getLastIteration(objects, newName)
			if err != nil {
				log.Panicf("History is broken for object %s, err: %v\n", rName, err)
			}
			canonicalHistory = append(canonicalHistory, lastIteration)
			if lastIteration.renameFrom == "" {
				// last iteration is a definition (not a rename), we can stop
				objectHistories[rName] = canonicalHistory
				break
			}
			// still a rename, so keep searching
			newName = lastIteration.renameFrom
		}
		if i == 10 {
			return nil, fmt.Errorf("too many renames for function %s", rName)
		}
	}
	if err := nameRows.Err(); err != nil {
		return nil, fmt.Errorf("rows.Err: %w", err)
	}
	return objectHistories, nil
}

func writeHistoriesToFile(histories map[string][]iteration, filePath string) error {
	objectsFile, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("os.Create: %w", err)
	}

	// sort by object name so that the output is deterministic
	names := make([]string, 0, len(histories))
	for name := range histories {
		names = append(names, name)
	}
	sort.Strings(names)

	if _, err := objectsFile.WriteString("-- **This is a generated file.** It contains the latest definitions of " +
		"objects, so you don't need to go searching\n-- through migrations.\n-- If you need to modify an object, " +
		"do not edit this file! Create a new migration instead.\n\n"); err != nil {
		return fmt.Errorf("objectsFile.WriteString: %w", err)
	}

	for _, name := range names {
		trail := histories[name]
		def := trail[len(trail)-1]
		lines := []string{fmt.Sprintf("-- %s, defined in %d.sql:\n%s", name, def.version, def.body)}
		for i := len(trail) - 2; i >= 0; i-- {
			lines = append(lines, fmt.Sprintf("-- renamed in %d.sql:", trail[i].version))
			lines = append(lines, trail[i].body)
		}
		if _, err := objectsFile.WriteString(strings.Join(lines, "\n") + "\n\n"); err != nil {
			return fmt.Errorf("objectsFile.WriteString: %w", err)
		}
	}

	return nil
}

// generateSchemaFiles generates files containing all non-table object definitions (and renames)
func generateSchemaFiles(migrationsDirPath string, db *sql.DB) error {
	routines := make(map[string]*dbObject)
	views := make(map[string]*dbObject)

	sqlFiles, err := findMigrations(migrationsDirPath)
	if err != nil {
		return err
	}

	// Iterate over migration files and extract all database non-table object definitions and renames
	for version, sqlFilePath := range sqlFiles {
		filePath := filepath.Join(migrationsDirPath, sqlFilePath)
		mig, err := os.ReadFile(filePath)
		if err != nil {
			return fmt.Errorf("os.ReadFile: %w", err)
		}
		migStr := string(mig)

		if err = addObjectDefs(routines, migStr, version, funcDefRE); err != nil {
			return err
		}
		if err = addObjectDefs(views, migStr, version, viewDefRE); err != nil {
			return err
		}

		if err = addObjectRenames(routines, migStr, version, funcRenameRE); err != nil {
			return err
		}
		if err = addObjectRenames(views, migStr, version, viewRenameRE); err != nil {
			return err
		}

	}

	// Create the gen directory if it doesn't exist
	genDirPath := filepath.Join(migrationsDirPath, "schema_gen")
	if _, err := os.Stat(genDirPath); os.IsNotExist(err) {
		if err := os.Mkdir(genDirPath, 0755); err != nil {
			return err
		}
	}

	// Build histories and write to file. A history starts with a definition and tracks all the renames an object
	// has had since its last definition.
	{
		// We ignore routines written in C bc they're most likely extensions
		rows, err := db.Query(`select routine_name from information_schema.routines 
                    where specific_schema = 'public' and external_language != 'C'`)
		if err != nil {
			return fmt.Errorf("db.Query: %w", err)
		}
		defer rows.Close()

		routineHistories, err := makeHistories(routines, rows)
		if err != nil {
			return err
		}

		routinesFilepath := filepath.Join(genDirPath, "routines.sql")

		if err := writeHistoriesToFile(routineHistories, routinesFilepath); err != nil {
			return err
		}
	}

	// Build view histories and write to file
	{
		nameRows, err := db.Query(`select table_name from information_schema.views where table_schema = 'public'`)
		if err != nil {
			return fmt.Errorf("db.Query: %w", err)
		}
		defer nameRows.Close()

		viewHistories, err := makeHistories(views, nameRows)
		if err != nil {
			return err
		}

		viewsFilePath := filepath.Join(genDirPath, "views.sql")
		if err := writeHistoriesToFile(viewHistories, viewsFilePath); err != nil {
			return err
		}
	}

	return nil
}
