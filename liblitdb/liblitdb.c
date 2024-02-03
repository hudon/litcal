#include "liblitdb.h"

#include <stdio.h>
#include <string.h>

static const char *lit_color_names[LIT_COLOR_COUNT] = {
    [LIT_WHITE] = "white",   [LIT_BLACK] = "black",   [LIT_RED] = "red",
    [LIT_GREEN] = "green",   [LIT_VIOLET] = "violet", [LIT_GOLD] = "gold",
    [LIT_SILVER] = "silver", [LIT_ROSE] = "rose"};

bool lit_color_from_string(const char *color_str, lit_color_t *color_out) {
  if (color_str == NULL || color_out == NULL) {
    return false;
  }
  for (int i = 0; i < LIT_COLOR_COUNT; i++) {
    if (lit_color_names[i] != NULL &&
        strcmp(lit_color_names[i], color_str) == 0) {
      *color_out = i;
      return true;
    }
  }
  return false;
}

lit_status_t lit_get_celebration(sqlite3 *db, int64_t epoch_seconds,
                                 lit_celebration_t *cel_out) {
  if (db == NULL || cel_out == NULL || epoch_seconds < 0) {
    return LIT_INVALID_ARGUMENT;
  }
  char *query =
      "select lc.event_key, lc.rank, lc.title, lc.subtitle, lc.gospel, "
      "lc.gospel_ref, lc.readings_url, lcol.name as color "
      "from lit_celebration lc "
      "join lit_day ld on lc.lit_day_id = ld.id "
      "join lit_color lcol on lc.lit_color_id = lcol.id "
      "join lit_season ls on ld.lit_season_id = ls.id "
      "where ld.secular_date_s = ?;";

  sqlite3_stmt *stmt;
  int rc = sqlite3_prepare_v2(db, query, -1, &stmt, NULL);
  if (rc != SQLITE_OK) {
    fprintf(stderr, "Failed to prepare statement: %s\n", sqlite3_errmsg(db));
    return LIT_ERROR;
  }

  int ret = LIT_OK;

  rc = sqlite3_bind_int64(stmt, 1, epoch_seconds);
  if (rc != SQLITE_OK) {
    fprintf(stderr, "Failed to bind parameter: %s\n", sqlite3_errmsg(db));
    goto error_out;
  }

  rc = sqlite3_step(stmt);
  if (rc == SQLITE_ROW) {
    const char *event_key = (const char *)sqlite3_column_text(stmt, 0);
    int rank = sqlite3_column_int(stmt, 1);
    const char *title = (const char *)sqlite3_column_text(stmt, 2);
    const char *subtitle = (const char *)sqlite3_column_text(stmt, 3);
    const char *gospel_text = (const char *)sqlite3_column_text(stmt, 4);
    const char *gospel_ref = (const char *)sqlite3_column_text(stmt, 5);
    const char *readings_url = (const char *)sqlite3_column_text(stmt, 6);
    const char *color = (const char *)sqlite3_column_text(stmt, 7);

    snprintf(cel_out->event_key, sizeof(cel_out->event_key), "%s", event_key);
    cel_out->rank = rank;
    snprintf(cel_out->title, sizeof(cel_out->title), "%s", title);
    snprintf(cel_out->subtitle, sizeof(cel_out->subtitle), "%s", subtitle);
    if ((cel_out->gospel_text = strdup(gospel_text)) == NULL) {
      fprintf(stderr, "Failed to strdup gospel_text\n");
      goto error_out;
    }
    snprintf(cel_out->gospel_ref, sizeof(cel_out->gospel_ref), "%s",
             gospel_ref);
    if ((cel_out->readings_url = strdup(readings_url)) == NULL) {
      fprintf(stderr, "Failed to strdup readings_url\n");
      goto error_out;
    }
    if (!lit_color_from_string(color, &cel_out->color)) {
      fprintf(stderr, "Failed to parse color: %s\n", color);
      goto error_out;
    }

    cel_out->is_valid = true;
  } else if (rc == SQLITE_DONE) {
    // no row found
    cel_out->is_valid = false;
  } else {
    fprintf(stderr, "Failed to step: %s\n", sqlite3_errmsg(db));
    goto error_out;
  }

  goto out;
error_out:
  ret = LIT_ERROR;
out:
  sqlite3_finalize(stmt);
  return ret;
}
