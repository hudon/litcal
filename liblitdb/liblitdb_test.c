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

void test_get_celebration__nulldb() {
  int result = lit_get_celebration(NULL, 1, 0, NULL);
  assert(result == LIT_INVALID_ARGUMENT);
}

void test_get_celebration__negative_epoch() {
  sqlite3 *db;
  int result = lit_get_celebration(db, 1, -1, NULL);
  assert(result == LIT_INVALID_ARGUMENT);
}

// test that the function returns an empty celebration when the epoch is missing
// in the database
void test_get_celebration__missing() {
  sqlite3 *db = open_db("data/litcal.test.sqlite");
  if (db == NULL) {
    return;
  }

  lit_celebration_t cel = {};
  int result = lit_get_celebration(db, 1, 0, &cel);

  assert(!cel.is_valid);
  assert(result == LIT_OK);

  sqlite3_close(db);
}

// test that the function returns an error when the table is missing
void test_get_celebration__error_no_table() {
  sqlite3 *db = open_db("data/empty.test.sqlite");
  if (db == NULL) {
    return;
  }

  lit_celebration_t cel = {};
  int result = lit_get_celebration(db, 1, 0, &cel);

  assert(!cel.is_valid);
  assert(result == LIT_ERROR);

  sqlite3_close(db);
}

// test that the function returns a valid celebration when the epoch is present
// in the database
void test_get_celebration__valid() {
  sqlite3 *db = open_db("./data/litcal.test.sqlite");
  if (db == NULL) {
    return;
  }

  lit_celebration_t cel = {};
  int64_t epoch = 1704931200;

  int result = lit_get_celebration(db, 1, epoch, &cel);

  assert(cel.is_valid);
  assert(result == LIT_OK);

  sqlite3_close(db);
}

void test_get_min_and_max__nullargs() {
  sqlite3 *db = open_db(NULL);
  int64_t min, max;
  int result = lit_get_min_and_max(NULL, 1, &min, &max);
  assert(result == LIT_INVALID_ARGUMENT);

  result = lit_get_min_and_max(db, 1, NULL, &max);
  assert(result == LIT_INVALID_ARGUMENT);

  result = lit_get_min_and_max(NULL, 1, &min, NULL);
  assert(result == LIT_INVALID_ARGUMENT);
}

void test_get_min_and_max__valid() {
  sqlite3 *db = open_db("./data/litcal.test.sqlite");
  if (db == NULL) {
    return;
  }

  int64_t min, max;
  int result = lit_get_min_and_max(db, 1, &min, &max);
  assert(result == LIT_OK);
  assert(min == 1704067200);
  assert(max == 1735603200);

  sqlite3_close(db);
}

int main() {
  test_get_celebration__nulldb();
  puts("test_get_celebration__nulldb passed");
  test_get_celebration__negative_epoch();
  puts("test_get_celebration__negative_epoch passed");
  test_get_celebration__error_no_table();
  puts("test_get_celebration__error_no_table passed");
  test_get_celebration__missing();
  puts("test_get_celebration__missing passed");
  test_get_celebration__valid();
  puts("test_get_celebration__valid passed");

  test_get_min_and_max__nullargs();
  puts("test_get_min_and_max__nullargs passed");
  test_get_min_and_max__valid();
  puts("test_get_min_and_max__valid passed");

  puts("All tests passed");
  return 0;
}
