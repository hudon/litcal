package main

import (
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"time"
)

func backup(sqliteFilePath string) error {
	backupDir := filepath.Dir(sqliteFilePath)
	timestamp := time.Now().Format("20060102_150405")
	backupFileName := fmt.Sprintf("%s_%s.%s", getFileNameWithoutExtension(sqliteFilePath), timestamp,
		filepath.Ext(sqliteFilePath))
	backupFilePath := filepath.Join(backupDir, backupFileName)

	// Copy the database file to the backup file
	srcFile, err := os.Open(sqliteFilePath)
	if err != nil {
		return fmt.Errorf("os.Open: %w", err)
	}
	defer srcFile.Close()
	dstFile, err := os.Create(backupFilePath)
	if err != nil {
		return fmt.Errorf("os.Open: %w", err)
	}
	defer dstFile.Close()

	_, err = io.Copy(dstFile, srcFile)
	if err != nil {
		return err
	}

	// Get the source file info
	srcInfo, err := srcFile.Stat()
	if err != nil {
		return fmt.Errorf("os.Stat: %w", err)
	}

	// Set the destination file mode to be the same as the source file
	err = dstFile.Chmod(srcInfo.Mode())
	if err != nil {
		return fmt.Errorf("os.Chmod: %w", err)
	}

	log.Printf("INFO: database backed up to %s\n", backupFilePath)
	return nil
}

func getFileNameWithoutExtension(filePath string) string {
	fileName := filepath.Base(filePath)
	fileNameWithoutExt := fileName[:len(fileName)-len(filepath.Ext(fileName))]
	return fileNameWithoutExt
}
