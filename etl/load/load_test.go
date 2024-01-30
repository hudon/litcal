package main

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
	// create test data and omit the event_key
	_, err = db.Exec(`
	create table lit_day (id integer primary key, secular_date_s integer);
	create table lit_celebration (id integer primary key, event_key text, lit_day_id integer, foreign key(lit_day_id) references lit_day(id));
	insert into lit_day (id, secular_date_s) values (1, 1609459200);
	insert into lit_day (id, secular_date_s) values (2, 1609545600);
	insert into lit_celebration (id, lit_day_id) values (1, 1);
	insert into lit_celebration (id, lit_day_id) values (2, 2);
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

	// verify that the 2 lit_celebration rows now have event_key's
	rows, err := db.Query("SELECT event_key FROM lit_celebration")
	if err != nil {
		t.Fatalf("Failed to query lit_celebration table: %v", err)
	}
	defer rows.Close()

	var eventKeySet = make(map[string]struct{})
	for rows.Next() {
		var eventKey string
		err := rows.Scan(&eventKey)
		if err != nil {
			t.Fatalf("Failed to scan row: %v", err)
		}
		eventKeySet[eventKey] = struct{}{}
	}

	expectedEventKeys := map[string]struct{}{"2021-01-01": {}, "2021-01-02": {}}

	if !compareMapKeys(eventKeySet, expectedEventKeys) {
		t.Fatalf("Unexpected event keys. Expected: %v, Got: %v", expectedEventKeys, eventKeySet)
	}
}

func compareMapKeys(map1, map2 map[string]struct{}) bool {
	if len(map1) != len(map2) {
		return false
	}

	for key := range map1 {
		if _, ok := map2[key]; !ok {
			return false
		}
	}

	return true
}
