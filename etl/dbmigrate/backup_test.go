package main

import (
	"bytes"
	"os"
	"path/filepath"
	"testing"
)

func TestBackup(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "test_migrations")
	if err != nil {
		t.Fatalf("Failed to create temporary directory: %v", err)
	}
	defer os.RemoveAll(tempDir)

	// Create a temporary SQLite file for testing
	tempFile, err := os.Create(filepath.Join(tempDir, "test.db"))
	if err != nil {
		t.Fatalf("Failed to create dummy db file: %v", err)
	}
	defer tempFile.Close()

	// Write test data to the temporary SQLite file
	testData := []byte("This is a test")
	_, err = tempFile.Write(testData)
	if err != nil {
		t.Fatalf("Failed to write test data to file: %v", err)
	}

	err = backup(tempFile.Name())
	if err != nil {
		t.Fatalf("Backup failed: %v", err)
	}

	// Verify that the backup file exists
	backupFilePathPattern := filepath.Join(tempDir, "test_*_*.db")
	backupFiles, err := filepath.Glob(backupFilePathPattern)
	if err != nil {
		t.Fatalf("Failed to find backup file: %v", err)
	}
	if len(backupFiles) == 0 {
		t.Fatalf("Backup file does not exist: %s", backupFilePathPattern)
	}
	backupFilePath := backupFiles[0]

	// Verify the content of the backup file
	backupData, err := os.ReadFile(backupFilePath)
	if err != nil {
		t.Fatalf("Failed to read backup file: %v", err)
	}
	if !bytes.Equal(backupData, testData) {
		t.Errorf("Backup file content does not match test data")
	}
}
