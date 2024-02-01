#include <sqlite3.h>
#include <stdio.h>

// Function to open a SQLite database
sqlite3 *openDatabase(const char *filepath) {
  sqlite3 *db;
  int rc = sqlite3_open(filepath, &db);
  if (rc != SQLITE_OK) {
    fprintf(stderr, "Cannot open database: %s\n", sqlite3_errmsg(db));
    return NULL;
  }
  return db;
}

// Function to query dummy data from a database
void queryDummyData(sqlite3 *db) {
  const char *sql = "SELECT * FROM dummy_table";
  sqlite3_stmt *stmt;
  int rc = sqlite3_prepare_v2(db, sql, -1, &stmt, NULL);
  if (rc != SQLITE_OK) {
    fprintf(stderr, "Failed to prepare statement: %s\n", sqlite3_errmsg(db));
    return;
  }
  while (sqlite3_step(stmt) == SQLITE_ROW) {
    // Process each row of data here
    // Example: printf("%s\n", sqlite3_column_text(stmt, 0));
  }
  sqlite3_finalize(stmt);
}

int main() {
  const char *filepath = "/Users/hudon/Code/litcal/db/litcaldb.db";
  sqlite3 *db = openDatabase(filepath);
  if (db != NULL) {
    queryDummyData(db);
    sqlite3_close(db);
  }
  return 0;
}
