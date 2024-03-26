#include "private.h"

#include <string.h>

static const char *lit_color_names[LIT_COLOR_COUNT] = {
   [LIT_WHITE] = "white",   [LIT_BLACK] = "black",   [LIT_RED] = "red",
   [LIT_GREEN] = "green",   [LIT_VIOLET] = "violet", [LIT_GOLD] = "gold",
   [LIT_SILVER] = "silver", [LIT_ROSE] = "rose"};

bool lit_color_from_string(const char *col_str, enum lit_color *out_col) {
	if (col_str == NULL || out_col == NULL) {
		return false;
	}
	for (int i = 0; i < LIT_COLOR_COUNT; i++) {
		if (lit_color_names[i] != NULL &&
		    strcmp(lit_color_names[i], col_str) == 0) {
			*out_col = i;
			return true;
		}
	}
	return false;
}

bool lit_get_celebration(
   sqlite3 *db, uint64_t cal_id,
   int64_t epoch_seconds,
   struct lit_celebration *out_cel,
   struct lit_error **out_err) {

	bool ret = false;

	char *argmsg = NULL;
	if (db == NULL) {
		argmsg = "invalid arg: db";
	} else if (epoch_seconds < 0) {
		argmsg = "invalid arg: epoch_seconds";
	} else if (out_cel == NULL) {
		argmsg = "invalid arg: out_cel";
	}
	if (argmsg != NULL) {
		lit_error_new(LIT_INVALID_ARGUMENT, argmsg, out_err);
		return false;
	}

	char *query =
	   "SELECT lc.event_key, lc.rank, lc.title, lc.subtitle, lc.gospel, "
	   "lc.gospel_ref, lc.readings_url, lcol.name AS color "
	   "FROM lit_celebration lc "
	   "JOIN lit_day ld ON lc.lit_day_id = ld.id "
	   "JOIN lit_color lcol ON lc.lit_color_id = lcol.id "
	   "JOIN lit_season ls ON ld.lit_season_id = ls.id "
	   "JOIN lit_year ly ON ls.lit_year_id = ly.id "
	   "WHERE ld.secular_date_s = ? AND ly.lit_calendar_id = ?;";

	sqlite3_stmt *stmt;
	int rc = sqlite3_prepare_v2(db, query, -1, &stmt, NULL);
	if (rc != SQLITE_OK) {
		lit_error_new_fmt(
		   LIT_ERROR,
		   "Failed to prepare statement: %s", sqlite3_errmsg(db), out_err);
		return false;
	}

	rc = sqlite3_bind_int64(stmt, 1, epoch_seconds);
	if (rc != SQLITE_OK) {
		lit_error_new_fmt(LIT_ERROR,
		                  "Failed to bind parameter: %s", sqlite3_errmsg(db), out_err);
		goto error_out;
	}

	rc = sqlite3_bind_int64(stmt, 2, cal_id);
	if (rc != SQLITE_OK) {
		lit_error_new_fmt(LIT_ERROR,
		                  "Failed to bind parameter: %s", sqlite3_errmsg(db), out_err);
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

		out_cel->rank = rank;
		out_cel->epoch_seconds = epoch_seconds;
		strlcpy(out_cel->event_key, event_key, sizeof(out_cel->event_key));
		strlcpy(out_cel->title, title, sizeof(out_cel->title));
		if (subtitle != NULL)
			strlcpy(out_cel->subtitle, subtitle, sizeof(out_cel->subtitle));
		strlcpy(out_cel->gospel_ref, gospel_ref, sizeof(out_cel->gospel_ref));
		if ((out_cel->gospel_text = strdup(gospel_text)) == NULL) {
			lit_error_new(LIT_ERROR, "Failed to strdup gospel_text", out_err);
			goto error_out;
		}
		if ((out_cel->readings_url = strdup(readings_url)) == NULL) {
			lit_error_new(LIT_ERROR, "Failed to strdup readings_url", out_err);
			goto error_out;
		}
		if (!lit_color_from_string(color, &out_cel->color)) {
			lit_error_new_fmt(LIT_ERROR, "Failed to parse color: %s", color, out_err);
			goto error_out;
		}
	} else if (rc == SQLITE_DONE) {
		lit_error_new(LIT_NOT_FOUND, "no row found", out_err);
		goto error_out;
	} else {
		lit_error_new_fmt(LIT_ERROR, "Failed to step: %s", sqlite3_errmsg(db), out_err);
		goto error_out;
	}

	ret = true;
	goto out;
error_out:
	ret = false;
out:
	sqlite3_finalize(stmt);
	return ret;
}

bool lit_get_min_and_max(
   sqlite3 *db, uint64_t cal_id,
   int64_t *out_min, int64_t *out_max,
   struct lit_error **out_err) {

	bool ret = false;

	if (db == NULL || out_min == NULL || out_max == NULL) {
		lit_error_new(LIT_INVALID_ARGUMENT, "Invalid arg", out_err);
		return false;
	}
	char *query =
	   "SELECT MIN(ld.secular_date_s), MAX(ld.secular_date_s) "
	   "FROM lit_day ld, lit_season ls, lit_year ly, lit_calendar lc "
	   "WHERE ld.lit_season_id = ls.id "
	   "AND ls.lit_year_id = ly.id "
	   "AND ly.lit_calendar_id = ?;";

	sqlite3_stmt *stmt;
	int rc = sqlite3_prepare_v2(db, query, -1, &stmt, NULL);
	if (rc != SQLITE_OK) {
		lit_error_new_fmt(LIT_ERROR,
		                  "Failed to prepare statement: %s", sqlite3_errmsg(db), out_err);
		return false;
	}

	rc = sqlite3_bind_int64(stmt, 1, cal_id);
	if (rc != SQLITE_OK) {
		lit_error_new_fmt(LIT_ERROR,
		                  "Failed to bind parameter: %s", sqlite3_errmsg(db), out_err);
		goto error_out;
	}

	rc = sqlite3_step(stmt);
	if (rc == SQLITE_ROW) {
		*out_min = sqlite3_column_int64(stmt, 0);
		*out_max = sqlite3_column_int64(stmt, 1);
	} else {
		lit_error_new_fmt(LIT_ERROR, "Failed to step: %s", sqlite3_errmsg(db), out_err);
		goto error_out;
	}

	ret = true;
	goto out;
error_out:
	ret = false;
out:
	sqlite3_finalize(stmt);
	return ret;
}
