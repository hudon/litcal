#ifndef LITDB_H
#define LITDB_H

#include <sqlite3.h>
#include <stdint.h>

int lit_get_celebration(sqlite3 *db, int64_t epoch_seconds);

#endif /* LITDB_H */
