extern "C" {
#include "litdb.h"
}

#include <catch2/catch_test_macros.hpp>

static int db_path(char *path, size_t size) {
	return snprintf(
		path,
		size,
		"%s/litcal.test.sqlite",
		DATA_DIR);
}

static int empty_db_path(char *path, size_t size) {
	return snprintf(
		path,
		size,
		"%s/empty.test.sqlite",
		DATA_DIR);
}

TEST_CASE( "get_celebration with null db", "[litdb]" ) {
	struct lit_error *err = NULL;
	bool res = lit_get_celebration(NULL, 1, 0, NULL, &err);
	REQUIRE(!res);
	REQUIRE(err->status == LIT_INVALID_ARGUMENT);
}

TEST_CASE( "get_celebration with negative epoch", "[litdb]" ) {
	sqlite3 *db;
	struct lit_error *err = NULL;
	bool res = lit_get_celebration(db, 1, -1, NULL, &err);
	REQUIRE(!res);
	REQUIRE(err->status == LIT_INVALID_ARGUMENT);
}

TEST_CASE( "get_celebration missing event", "[litdb]" ) {
	sqlite3 *db;
	char path[BUFSIZ];
	db_path(path, sizeof (path));
	REQUIRE(lit_open_db(path, &db, NULL));

	struct lit_celebration cel = {};
	struct lit_error *err = NULL;
	bool res = lit_get_celebration(db, 1, 0, &cel, &err);

	REQUIRE(!res);
	REQUIRE(err->status == LIT_NOT_FOUND);

	sqlite3_close(db);
}

TEST_CASE( "get_celebration returns error when table is missing", "[litdb]" ) {
	sqlite3 *db;
	char path[BUFSIZ];
	empty_db_path(path, sizeof (path));
	REQUIRE(lit_open_db(path, &db, NULL));

	struct lit_celebration cel = {};
	struct lit_error *err = NULL;
	bool res = lit_get_celebration(db, 1, 0, &cel, &err);

	REQUIRE(!res);
	REQUIRE(err->status == LIT_ERROR);

	sqlite3_close(db);
}

TEST_CASE( "get_celebration with a valid timestamp", "[litdb]" ) {
	sqlite3 *db;
	char path[BUFSIZ];
	db_path(path, sizeof (path));
	REQUIRE(lit_open_db(path, &db, NULL));

	struct lit_celebration cel = {};
	int64_t epoch = 1704931200;

	bool res = lit_get_celebration(db, 1, epoch, &cel, NULL);

	REQUIRE(res);
	REQUIRE(cel.epoch_seconds == epoch);
	REQUIRE(!strcmp(cel.season, "Ordinary Time"));
	REQUIRE(!strcmp(cel.title, "Thursday of the 1st Week of Ordinary Time"));
	REQUIRE(!strcmp(cel.subtitle, ""));
	REQUIRE(!strncmp(cel.gospel_text, "A leper", 7));
	REQUIRE(!strncmp(cel.readings_url, "http://", 7));

	lit_celebration_members_free(&cel);
	sqlite3_close(db);
}

TEST_CASE( "lit_celebration_members_free checks to NULL and sets to NULL", "[litdb]" ) {
	struct lit_celebration cel = {};
	cel.gospel_text = cel.readings_url = NULL;
	lit_celebration_members_free(&cel);
	cel.gospel_text = (char*)malloc(sizeof(char));
	cel.readings_url = (char*)malloc(sizeof(char));
	lit_celebration_members_free(&cel);
	REQUIRE( cel.gospel_text == NULL );
	REQUIRE( cel.readings_url == NULL );
}

TEST_CASE( "celebrations_in_range with a valid timestamps", "[litdb]" ) {
	sqlite3 *db;
	char path[BUFSIZ];
	db_path(path, sizeof (path));
	REQUIRE(lit_open_db(path, &db, NULL));

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

	REQUIRE(res);
	REQUIRE(cels->epoch_seconds == lo);
	REQUIRE(!strcmp(cels->season, "Ordinary Time"));
	REQUIRE(!strncmp(cels->title, "Thur", 4));
	REQUIRE(!strncmp(cels[1].title, "Fri", 3));
	REQUIRE(!strncmp(cels[2].title, "Sat", 3));

	REQUIRE(count == expected_count);
	REQUIRE(cels[expected_count - 1].epoch_seconds == hi);

	lit_celebrations_free(cels, count);
	sqlite3_close(db);
}

TEST_CASE( "get_min_and_max with a null args", "[litdb]" ) {
	sqlite3 *db;
	REQUIRE(lit_open_db(NULL, &db, NULL));
	int64_t min, max;
	struct lit_error *err = NULL;
	bool res = lit_get_min_and_max(NULL, 1, &min, &max, &err);
	REQUIRE(!res);
	REQUIRE(err->status == LIT_INVALID_ARGUMENT);

	res = lit_get_min_and_max(db, 1, NULL, &max, &err);
	REQUIRE(!res);
	REQUIRE(err->status == LIT_INVALID_ARGUMENT);

	res = lit_get_min_and_max(NULL, 1, &min, NULL, &err);
	REQUIRE(!res);
	REQUIRE(err->status == LIT_INVALID_ARGUMENT);
}

TEST_CASE( "get_min_and_max with a valid args", "[litdb]" ) {
	sqlite3 *db;
	char path[BUFSIZ];
	db_path(path, sizeof (path));
	REQUIRE(lit_open_db(path, &db, NULL));

	int64_t min, max;
	bool res = lit_get_min_and_max(db, 1, &min, &max, NULL);
	REQUIRE(res);
	REQUIRE(min == 1704067200);
	REQUIRE(max == 1735603200);

	sqlite3_close(db);
}