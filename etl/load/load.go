package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

type EventJSON struct {
	Date int64 `json:"date"`
}
type LitcalJSON struct {
	Events map[string]EventJSON `json:"events"`
}

// TODO: backup the db before loading
func main() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: go run load.go <db_file> <json_file>")
		return
	}

	dbFile := os.Args[1]
	jsonFile := os.Args[2]

	db, err := sql.Open("sqlite3", dbFile)
	if err != nil {
		fmt.Printf("Failed to open database: %v\n", err)
		return
	}
	defer db.Close()

	err = AddUniqueEventKeysFromFile(db, jsonFile)
	if err != nil {
		fmt.Printf("Failed to add unique event keys: %v\n", err)
		return
	}

	fmt.Println("Unique event keys added successfully!")
}

func LoadData(db *sql.DB, filename string) error {
	// TODO: Implement the function to load data into the database
	return nil
}

func AddUniqueEventKeysFromFile(db *sql.DB, jsonFilename string) error {
	jsonData, err := os.ReadFile(jsonFilename)
	if err != nil {
		return fmt.Errorf("failed to read JSON file: %w", err)
	}

	var parsedData LitcalJSON
	err = json.Unmarshal(jsonData, &parsedData)
	if err != nil {
		return fmt.Errorf("failed to parse JSON data: %w", err)
	}

	err = addUniqueEventKeys(db, parsedData)
	if err != nil {
		return err
	}

	return nil
}

func addUniqueEventKeys(db *sql.DB, data LitcalJSON) error {
	for key, event := range data.Events {
		// Use the date to find the lit_celebration by joining with lit_day
		// then update the lit_celebration with the event_key
		query := `
			UPDATE lit_celebration
			SET event_key = ?
			WHERE lit_day_id IN (select id from lit_day where lit_day.secular_date_s = ?)
			`
		_, err := db.Exec(query, key, event.Date)
		if err != nil {
			return fmt.Errorf("failed to update lit_celebration: %w", err)
		}
	}

	return nil
}
