#include "private.h"

#include <string.h>
#include <stdlib.h>
#include <sqlite3.h>

static const char *lit_color_names[LIT_COLOR_COUNT] = {
	[LIT_WHITE] = "white",   [LIT_BLACK] = "black",   [LIT_RED] = "red",
	[LIT_GREEN] = "green",   [LIT_VIOLET] = "violet", [LIT_GOLD] = "gold",
	[LIT_SILVER] = "silver", [LIT_ROSE] = "rose"};

void lit_celebrations_free(struct lit_celebration *cels, int count) {
	if (count < 1 || cels == NULL) return;
	while (count--) {
		lit_celebration_members_free(&cels[count]);
	}
	free(cels);
}

void lit_celebration_members_free(struct lit_celebration *cel) {
	if (cel->gospel_text != NULL) free(cel->gospel_text);
	if (cel->readings_url != NULL) free(cel->readings_url);
	cel->gospel_text = cel->readings_url = NULL;
}

bool lit_open_db(const char *filename, sqlite3 **out_db, struct lit_error **out_err) {
	sqlite3 *db;
	if (filename == NULL) {
		filename = ":memory:";
	}
	if (sqlite3_open(filename, &db) != SQLITE_OK) {
		lit_error_new_fmt(
			LIT_ERROR, "Can't open database: %s",
			sqlite3_errmsg(db), out_err
		);
		sqlite3_close(db);
		return false;
	}
	*out_db = db;
	return true;
}

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
	sqlite3 *db, int cal_id,
	int64_t epoch_seconds,
	struct lit_celebration *out_cel,
	struct lit_error **out_err
) {
	// this is a DRY version of the code (re-uses range func) but it leads to an unnecessary heap allocation
//	int c;
//	struct lit_celebration *cels;
//	bool rc = lit_celebrations_in_range(
//		db, cal_id,
//		epoch_seconds, epoch_seconds,
//		&cels, &c, out_err
//	);
//	if (!rc) return rc;
//	assert(c <= 1);
//
//	out_cel->rank = cels->rank;
//	out_cel->epoch_seconds = cels->epoch_seconds;
//	out_cel->color = cels->color;
//	strlcpy(out_cel->event_key, cels->event_key, sizeof(out_cel->event_key));
//	strlcpy(out_cel->title, cels->title, sizeof(out_cel->title));
//	strlcpy(out_cel->season, cels->season, sizeof out_cel->season);
//	strlcpy(out_cel->subtitle, cels->subtitle, sizeof out_cel->season);
//	strlcpy(out_cel->gospel_ref, cels->gospel_ref, sizeof(out_cel->gospel_ref));
//	if ((out_cel->gospel_text = strdup(cels->gospel_text)) == NULL) {
//		lit_error_new(LIT_ERROR, "Failed to strdup gospel_text", out_err);
//		return false;
//	}
//	if ((out_cel->readings_url = strdup(cels->readings_url)) == NULL) {
//		lit_error_new(LIT_ERROR, "Failed to strdup readings_url", out_err);
//		return false;
//	}
//
//	lit_celebrations_free(cels, c);
//
//	return true

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

	bool ret = false;
	out_cel->gospel_text = out_cel->readings_url = NULL;

	char *query =
		"SELECT lc.event_key, lc.rank, lc.title, lc.subtitle, lc.gospel, "
		"lc.gospel_ref, lc.readings_url, lcol.name AS color, ls.name "
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
		const char *season_name = (const char *)sqlite3_column_text(stmt, 8);

		out_cel->rank = rank;
		out_cel->epoch_seconds = epoch_seconds;
		strlcpy(out_cel->event_key, event_key, sizeof(out_cel->event_key));
		strlcpy(out_cel->title, title, sizeof(out_cel->title));
		strlcpy(out_cel->season, season_name, sizeof out_cel->season);
		if (subtitle == NULL) {
			out_cel->subtitle[0] = '\0'; // ensure subtitle is set to empty
		} else {
			strlcpy(out_cel->subtitle, subtitle, sizeof(out_cel->subtitle));
		}
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
	lit_celebration_members_free(out_cel);
out:
	sqlite3_finalize(stmt);
	return ret;
}

bool lit_celebrations_in_range(
	sqlite3 *db, int cal_id,
	int64_t lo, int64_t hi,
	struct lit_celebration *out_cels[],
	int *out_count,
	struct lit_error **out_err
) {
	bool ret = false;
	struct lit_celebration *cels = NULL;

	char *argmsg = NULL;
	if (db == NULL) {
		argmsg = "invalid arg: db";
	} else if (lo < 0 || hi < 0) {
		argmsg = "invalid args: lo, hi";
	} else if (out_cels == NULL) {
		argmsg = "invalid arg: out_cel";
	} else if (out_count == NULL) {
		argmsg = "invalid arg: out_count";
	}
	if (argmsg != NULL) {
		lit_error_new(LIT_INVALID_ARGUMENT, argmsg, out_err);
		return false;
	}

	char *query =
		"SELECT lc.event_key, lc.rank, lc.title, lc.subtitle, lc.gospel, "
		"lc.gospel_ref, lc.readings_url, lcol.name AS color, ls.name, "
		"ld.secular_date_s, COUNT(*) OVER () "
		"FROM lit_celebration lc "
		"JOIN lit_day ld ON lc.lit_day_id = ld.id "
		"JOIN lit_color lcol ON lc.lit_color_id = lcol.id "
		"JOIN lit_season ls ON ld.lit_season_id = ls.id "
		"JOIN lit_year ly ON ls.lit_year_id = ly.id "
		"WHERE ld.secular_date_s >= ? AND ld.secular_date_s <= ? AND ly.lit_calendar_id = ? "
		"ORDER BY ld.secular_date_s;";

	sqlite3_stmt *stmt;
	int rc = sqlite3_prepare_v2(db, query, -1, &stmt, NULL);
	if (rc != SQLITE_OK) {
		lit_error_new_fmt(
			LIT_ERROR,
			"Failed to prepare statement: %s", sqlite3_errmsg(db), out_err);
		return false;
	}

	rc = sqlite3_bind_int64(stmt, 1, lo);
	if (rc != SQLITE_OK) {
		lit_error_new_fmt(LIT_ERROR,
				  "Failed to bind parameter lo: %s", sqlite3_errmsg(db), out_err);
		goto error_out;
	}

	rc = sqlite3_bind_int64(stmt, 2, hi);
	if (rc != SQLITE_OK) {
		lit_error_new_fmt(LIT_ERROR,
				  "Failed to bind parameter hi: %s", sqlite3_errmsg(db), out_err);
		goto error_out;
	}

	rc = sqlite3_bind_int64(stmt, 3, cal_id);
	if (rc != SQLITE_OK) {
		lit_error_new_fmt(
			LIT_ERROR,
			"Failed to bind parameter cal_id: %s",
			sqlite3_errmsg(db),
			out_err);
		goto error_out;
	}

	*out_count = 0;
	rc = sqlite3_step(stmt);
	while (rc == SQLITE_ROW) {
		const char *event_key = (const char *)sqlite3_column_text(stmt, 0);
		int rank = sqlite3_column_int(stmt, 1);
		const char *title = (const char *)sqlite3_column_text(stmt, 2);
		const char *subtitle = (const char *)sqlite3_column_text(stmt, 3);
		const char *gospel_text = (const char *)sqlite3_column_text(stmt, 4);
		const char *gospel_ref = (const char *)sqlite3_column_text(stmt, 5);
		const char *readings_url = (const char *)sqlite3_column_text(stmt, 6);
		const char *color = (const char *)sqlite3_column_text(stmt, 7);
		const char *season_name = (const char *)sqlite3_column_text(stmt, 8);
		int date_seconds = sqlite3_column_int(stmt, 9);
		int count = sqlite3_column_int(stmt, 10);
		if (cels == NULL) {
			cels = (struct lit_celebration*)malloc(
				count * sizeof(struct lit_celebration)
			);
			if (cels == NULL) {
				lit_error_new(LIT_NO_MEM,
					      "Failed to allocate memory for lit_celebration array.",
					      out_err);
				goto error_out;
			}
		}
		struct lit_celebration *cel = &cels[(*out_count)++];
		cel->gospel_text = cel->readings_url = NULL;
		cel->rank = rank;
		cel->epoch_seconds = date_seconds;
		strlcpy(cel->event_key, event_key, sizeof(cel->event_key));
		strlcpy(cel->title, title, sizeof(cel->title));
		strlcpy(cel->season, season_name, sizeof cel->season);
		if (subtitle == NULL) {
			cel->subtitle[0] = '\0'; // ensure subtitle is set to empty
		} else {
			strlcpy(cel->subtitle, subtitle, sizeof(cel->subtitle));
		}
		strlcpy(cel->gospel_ref, gospel_ref, sizeof(cel->gospel_ref));
		if ((cel->gospel_text = strdup(gospel_text)) == NULL) {
			lit_error_new(LIT_ERROR, "Failed to strdup gospel_text", out_err);
			goto error_out;
		}
		if ((cel->readings_url = strdup(readings_url)) == NULL) {
			lit_error_new(LIT_ERROR, "Failed to strdup readings_url", out_err);
			goto error_out;
		}
		if (!lit_color_from_string(color, &cel->color)) {
			lit_error_new_fmt(LIT_ERROR, "Failed to parse color: %s", color, out_err);
			goto error_out;
		}
		rc = sqlite3_step(stmt);
	}
	 if (rc != SQLITE_DONE) {
		lit_error_new_fmt(LIT_ERROR, "Failed to step: %s", sqlite3_errmsg(db), out_err);
		goto error_out;
	}
	if (*out_count == 0) {
		lit_error_new(LIT_NOT_FOUND, "no row found", out_err);
		goto error_out;
	}
	*out_cels = cels;
	ret = true;
	goto out;
error_out:
	lit_celebrations_free(cels, *out_count);
	ret = false;
out:
	sqlite3_finalize(stmt);
	return ret;
}

bool lit_get_min_and_max(
	sqlite3 *db, int cal_id,
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
