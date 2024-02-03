#include "liblitdb.h"

#include <assert.h>
#include <sqlite3.h>
#include <stddef.h>
#include <stdio.h>

sqlite3 *open_db(const char *filename) {
  sqlite3 *db;
  if (filename == NULL) {
    filename = ":memory:";
  }
  if (sqlite3_open(filename, &db) != SQLITE_OK) {
    fprintf(stderr, "Can't open database: %s\n", sqlite3_errmsg(db));
    sqlite3_close(db);
    return NULL;
  }

  return db;
}

void test_lit_get_celebration_nulldb() {
  int result = lit_get_celebration(NULL, 0, NULL);
  assert(result == LIT_INVALID_ARGUMENT);
}

void test_lit_get_celebration_negative_epoch() {
  sqlite3 *db;
  int result = lit_get_celebration(db, -1, NULL);
  assert(result == LIT_INVALID_ARGUMENT);
}

// test that the function returns an empty celebration when the epoch is missing
// in the database
void test_lit_get_celebration_missing() {
  sqlite3 *db = open_db("data/litcal.test.sqlite");
  if (db == NULL) {
    return;
  }

  lit_celebration_t cel = {};
  int result = lit_get_celebration(db, 0, &cel);

  assert(!cel.is_valid);
  assert(result == LIT_OK);

  sqlite3_close(db);
}

// test that the function returns an error when the table is missing
void test_lit_get_celebration_error_no_table() {
  sqlite3 *db = open_db("data/empty.test.sqlite");
  if (db == NULL) {
    return;
  }

  lit_celebration_t cel = {};
  int result = lit_get_celebration(db, 0, &cel);

  assert(!cel.is_valid);
  assert(result == LIT_ERROR);

  sqlite3_close(db);
}

// test that the function returns a valid celebration when the epoch is present
// in the database
void test_lit_get_celebration_valid() {
  sqlite3 *db = open_db("./data/litcal.test.sqlite");
  if (db == NULL) {
    return;
  }

  lit_celebration_t cel = {};
  int64_t epoch = 1704931200;

  int result = lit_get_celebration(db, epoch, &cel);

  assert(cel.is_valid);
  assert(result == LIT_OK);

  sqlite3_close(db);
}

int main() {
  test_lit_get_celebration_nulldb();
  puts("test_lit_get_celebration_nulldb passed");
  test_lit_get_celebration_negative_epoch();
  puts("test_lit_get_celebration_negative_epoch passed");
  test_lit_get_celebration_error_no_table();
  puts("test_lit_get_celebration_error_no_table passed");
  test_lit_get_celebration_missing();
  puts("test_lit_get_celebration_missing passed");
  test_lit_get_celebration_valid();
  puts("test_lit_get_celebration_valid passed");

  puts("All tests passed");
  return 0;
}
