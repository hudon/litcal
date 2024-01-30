package load

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

	// Call the AddUniqueEventKeysFromJSON function with the parsed JSON
	err = addUniqueEventKeys(db, parsedData)
	if err != nil {
		return err
	}

	return nil
}

func addUniqueEventKeys(db *sql.DB, data LitcalJSON) error {
	// TODO: implement;
	// iterate over the events, use the date as the key to look for the celebration in the sqlite db
	// then take the key of the vent and insert it as event_key into the table
}
