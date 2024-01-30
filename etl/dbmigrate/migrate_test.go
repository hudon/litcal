package main

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"testing"

	_ "github.com/mattn/go-sqlite3"
)

func TestMigrate(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "test_migrations")
	if err != nil {
		t.Fatalf("Failed to create temporary directory: %v", err)
	}
	defer os.RemoveAll(tempDir)
	migrationFiles := map[int]string{
		1: "1.sql",
		2: "2.sql",
		3: "3.sql",
	}
	for version, filename := range migrationFiles {
		filePath := filepath.Join(tempDir, filename)
		err := os.WriteFile(filePath, []byte(fmt.Sprintf(`
--UP
create table dummy%d (id integer primary key);
--DOWN
drop table dummy%d;
		`, version, version)), 0644)
		if err != nil {
			t.Fatalf("Failed to create test migration file: %v", err)
		}
	}

	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Test migrating up to version 3
	err = migrate(tempDir, 3, db)
	if err != nil {
		t.Fatalf("Failed to migrate: %v", err)
	}

	if err = verifyDB(db, 3); err != nil {
		t.Fatalf("%v", err)
	}

	// Test migrating down to version 1
	err = migrate(tempDir, 1, db)
	if err != nil {
		t.Fatalf("Failed to migrate: %v", err)
	}

	if err = verifyDB(db, 1); err != nil {
		t.Fatalf("%v", err)
	}
}

func verifyDB(db *sql.DB, expectedCount int) error {
	var version int
	err := db.QueryRow("select version from version").Scan(&version)
	if err != nil {
		return fmt.Errorf("Failed to retrieve migration version: %v", err)
	} else if version != expectedCount {
		return fmt.Errorf("Unexpected migration version. Expected: %d, Got: %d", expectedCount, version)
	}
	var dummyTablesCount int
	err = db.QueryRow("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name LIKE 'dummy%'").Scan(&dummyTablesCount)
	if err != nil {
		return fmt.Errorf("Failed to retrieve dummy tables count: %v", err)
	} else if dummyTablesCount != expectedCount {
		return fmt.Errorf("Unexpected dummy tables count. Expected: %d, Got: %d", expectedCount, dummyTablesCount)
	}
	return nil
}
