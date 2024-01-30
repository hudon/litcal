package load

import (
	"database/sql"
	"testing"

	_ "github.com/mattn/go-sqlite3"
)

func TestAddUniqueEventKeys(t *testing.T) {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()
	_, err = db.Exec(`
	create table lit_day (id integer primary key, secular_date_s integer);
	create table lit_celebration (id integer primary key, name text, date integer, event_key text unique);
	`)
	if err != nil {
		t.Fatalf("Failed to create table: %v", err)
	}

	litcalJSON := LitcalJSON{
		Events: map[string]EventJSON{
			"2021-01-01": {
				Date: 1609459200,
			},
			"2021-01-02": {
				Date: 1609545600,
			},
		},
	}
	err = addUniqueEventKeys(db, litcalJSON)
	if err != nil {
		t.Fatalf("Failed to load data: %v", err)
	}

	// TODO: Add assertions to check if the data was loaded correctly

}
