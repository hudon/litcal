#include "litdb.h"
#include "private_test.h"

#include <assert.h>
#include <sqlite3.h>
#include <stddef.h>
#include <stdio.h>
#include <stdbool.h>

void test_get_celebration__nulldb() {
	struct lit_error *err = NULL;
	bool res = lit_get_celebration(NULL, 1, 0, NULL, &err);
	assert(!res);
	assert(err->status == LIT_INVALID_ARGUMENT);
}

void test_get_celebration__negative_epoch() {
	sqlite3 *db;
	struct lit_error *err = NULL;
	bool res = lit_get_celebration(db, 1, -1, NULL, &err);
	assert(!res);
	assert(err->status == LIT_INVALID_ARGUMENT);
}

// test that the function returns an empty celebration when the epoch is missing
// in the database
void test_get_celebration__missing() {
	sqlite3 *db;
	assert(open_db("data/litcal.test.sqlite", &db, NULL));

	struct lit_celebration cel = {};
	struct lit_error *err = NULL;
	bool res = lit_get_celebration(db, 1, 0, &cel, &err);

	assert(!res);
	assert(err->status == LIT_NOT_FOUND);

	sqlite3_close(db);
}

// test that the function returns an error when the table is missing
void test_get_celebration__error_no_table() {
	sqlite3 *db;
	assert(open_db("data/empty.test.sqlite", &db, NULL));

	struct lit_celebration cel = {};
	struct lit_error *err = NULL;
	bool res = lit_get_celebration(db, 1, 0, &cel, &err);

	assert(!res);
	assert(err->status == LIT_ERROR);

	sqlite3_close(db);
}

// test that the function returns a valid celebration when the epoch is present
// in the database
void test_get_celebration__valid() {
	sqlite3 *db;
	assert(open_db("./data/litcal.test.sqlite", &db, NULL));

	struct lit_celebration cel = {};
	int64_t epoch = 1704931200;

	bool res = lit_get_celebration(db, 1, epoch, &cel, NULL);

	assert(res);
	assert(cel.epoch_seconds == epoch);

	sqlite3_close(db);
}

void test_get_min_and_max__nullargs() {
	sqlite3 *db;
	assert(open_db(NULL, &db, NULL));
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

void test_get_min_and_max__valid() {
	sqlite3 *db;
	assert(open_db("./data/litcal.test.sqlite", &db, NULL));

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

	test_get_min_and_max__nullargs();
	puts("test_get_min_and_max__nullargs passed");
	test_get_min_and_max__valid();
	puts("test_get_min_and_max__valid passed");

	run_errors_test();

	puts("All tests passed");
	return 0;
}
