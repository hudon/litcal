#include "litdb.h"
#include "private_test.h"
#include "private.h"

#include <assert.h>
#include <sqlite3.h>
#include <stddef.h>
#include <stdio.h>
#include <stdbool.h>
#include <string.h>

void test_get_celebration__nulldb(void) {
	struct lit_error *err = NULL;
	bool res = lit_get_celebration(NULL, 1, 0, NULL, &err);
	assert(!res);
	assert(err->status == LIT_INVALID_ARGUMENT);
}

void test_get_celebration__negative_epoch(void) {
	sqlite3 *db;
	struct lit_error *err = NULL;
	bool res = lit_get_celebration(db, 1, -1, NULL, &err);
	assert(!res);
	assert(err->status == LIT_INVALID_ARGUMENT);
}

// test that the function returns an empty celebration when the epoch is missing
// in the database
void test_get_celebration__missing(void) {
	sqlite3 *db;
	assert(lit_open_db("data/litcal.test.sqlite", &db, NULL));

	struct lit_celebration cel = {};
	struct lit_error *err = NULL;
	bool res = lit_get_celebration(db, 1, 0, &cel, &err);

	assert(!res);
	assert(err->status == LIT_NOT_FOUND);

	sqlite3_close(db);
}

// test that the function returns an error when the table is missing
void test_get_celebration__error_no_table(void) {
	sqlite3 *db;
	assert(lit_open_db("data/empty.test.sqlite", &db, NULL));

	struct lit_celebration cel = {};
	struct lit_error *err = NULL;
	bool res = lit_get_celebration(db, 1, 0, &cel, &err);

	assert(!res);
	assert(err->status == LIT_ERROR);

	sqlite3_close(db);
}

// test that the function returns a valid celebration when the epoch is present
// in the database
void test_get_celebration__valid(void) {
	sqlite3 *db;
	assert(lit_open_db("./data/litcal.test.sqlite", &db, NULL));

	struct lit_celebration cel = {};
	int64_t epoch = 1704931200;

	bool res = lit_get_celebration(db, 1, epoch, &cel, NULL);

	assert(res);
	assert(cel.epoch_seconds == epoch);
	assert(!strcmp(cel.season, "Ordinary Time"));

	lit_celebration_members_free(cel);
	sqlite3_close(db);
}

void test_celebrations_in_range__valid(void) {
	sqlite3 *db;
	assert(lit_open_db("./data/litcal.test.sqlite", &db, NULL));

	int lo = 1704931200;
	int secs_per_day = 60 * 60 * 24;
	int expected_count = 3;
	int hi = lo + (expected_count - 1) * secs_per_day;
	struct lit_celebration *cels;
	int count;
	bool res = lit_celebrations_in_range(
		db, 1,
		lo, hi,
		&cels, &count, NULL);

	assert(res);
	assert(cels->epoch_seconds == lo);
	assert(!strcmp(cels->season, "Ordinary Time"));
	assert(!strncmp(cels->title, "Thur", 4));
	assert(!strncmp(cels[1].title, "Fri", 3));
	assert(!strncmp(cels[2].title, "Sat", 3));

	assert(count == expected_count);
	assert(cels[expected_count - 1].epoch_seconds == hi);

	lit_celebrations_free(cels, count);
	sqlite3_close(db);
}

void test_get_min_and_max__nullargs(void) {
	sqlite3 *db;
	assert(lit_open_db(NULL, &db, NULL));
	int64_t min, max;
	struct lit_error *err = NULL;
	bool res = lit_get_min_and_max(NULL, 1, &min, &max, &err);
	assert(!res);
	assert(err->status == LIT_INVALID_ARGUMENT);

	res = lit_get_min_and_max(db, 1, NULL, &max, &err);
	assert(!res);
	assert(err->status == LIT_INVALID_ARGUMENT);

	res = lit_get_min_and_max(NULL, 1, &min, NULL, &err);
	assert(!res);
	assert(err->status == LIT_INVALID_ARGUMENT);
}

void test_get_min_and_max__valid(void) {
	sqlite3 *db;
	assert(lit_open_db("./data/litcal.test.sqlite", &db, NULL));

	int64_t min, max;
	bool res = lit_get_min_and_max(db, 1, &min, &max, NULL);
	assert(res);
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

	test_celebrations_in_range__valid();
	puts("test_celebrations_in_range__valid passed");

	test_get_min_and_max__nullargs();
	puts("test_get_min_and_max__nullargs passed");
	test_get_min_and_max__valid();
	puts("test_get_min_and_max__valid passed");

	run_errors_test();
	run_dates_test();

	puts("All tests passed");
	return 0;
}
