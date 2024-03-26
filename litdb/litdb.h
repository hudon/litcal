#ifndef LITDB_H
#define LITDB_H

#include <sqlite3.h>
#include <stdbool.h>
#include <stdint.h>

enum lit_status {
  LIT_OK = 0,
  LIT_ERROR = 1,
  LIT_INVALID_ARGUMENT = 2,
  LIT_NOT_FOUND = 3,
};

struct lit_error {
  enum lit_status status;
  char message[256];
};

void lit_error_free(struct lit_error *err);


enum lit_color {
  LIT_WHITE,
  LIT_BLACK,
  LIT_RED,
  LIT_GREEN,
  LIT_VIOLET,
  LIT_GOLD,
  LIT_SILVER,
  LIT_ROSE,

  LIT_COLOR_COUNT,
};

static const char *lit_color_names[LIT_COLOR_COUNT];
bool lit_color_from_string(const char *col_str, enum lit_color *out_col);


struct lit_celebration {
  /// The key is unique among other celebrations, but if the celebration appears
  /// on a different year, the key is the same
  char event_key[128];  // should be less brittle than "name" as it isn't used
                        // for display purposes
  int rank;
  enum lit_color color;
  char title[256];
  char subtitle[128];
  char gospel_ref[64];
  char *gospel_text;
  char *readings_url;

  int64_t epoch_seconds; /// seconds from 19700101 to 00:00 (midnight the morning of) on the day of this celebration
};

bool lit_get_celebration(
    sqlite3 *db, uint64_t cal_id,
    int64_t epoch_econds,
    struct lit_celebration *out_cel,
    struct lit_error **out_err);

bool lit_get_min_and_max(
    sqlite3 *db, uint64_t cal_id,
    int64_t *out_min, int64_t *out_max,
    struct lit_error **out_err);

#endif /* LITDB_H */
