#ifndef LITDB_H
#define LITDB_H

#include <sqlite3.h>
#include <stdbool.h>
#include <stdint.h>

typedef enum {
  LIT_OK = 0,
  LIT_ERROR = 1,
  LIT_INVALID_ARGUMENT = 2,
} lit_status_t;

typedef enum {
  LIT_WHITE,
  LIT_BLACK,
  LIT_RED,
  LIT_GREEN,
  LIT_VIOLET,
  LIT_GOLD,
  LIT_SILVER,
  LIT_ROSE,

  LIT_COLOR_COUNT,
} lit_color_t;

// This will get you the name from the color code
static const char *lit_color_names[LIT_COLOR_COUNT];
// This will get you the color code from the name
bool lit_color_from_string(const char *color_str, lit_color_t *color_out);

typedef struct lit_celebration {
  /// The key is unique among other celebrations, but if the celebration appears
  /// on a different year, the key is the same
  char event_key[128];  // should be less brittle than "name" as it isn't used
                        // for display purposes
  int rank;
  lit_color_t color;
  char title[256];
  char subtitle[128];
  char gospel_ref[64];
  char *gospel_text;
  char *readings_url;

  bool is_valid;
} lit_celebration_t;

// If is_valid is false but the return is LIT_OK, it means that the celebration
// wasn't found
lit_status_t lit_get_celebration(sqlite3 *db, int64_t epoch_seconds,
                                 lit_celebration_t *cel_out);

// TODO: min and max

#endif /* LITDB_H */
