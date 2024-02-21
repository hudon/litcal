#ifndef LITDB_H
#define LITDB_H

#include <sqlite3.h>
#include <stdbool.h>
#include <stdint.h>

enum LitStatus {
  LIT_OK = 0,
  LIT_ERROR = 1,
  LIT_INVALID_ARGUMENT = 2,
};

struct LitError {
  enum LitStatus status;
  char message[256];
};

void lit_error_free(struct LitError *err);


enum LitColor {
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

static const char *lit_color_name[LIT_COLOR_COUNT];
bool lit_color_from_string(const char *colorStr, enum LitColor *outColor);


struct LitCelebration {
  /// The key is unique among other celebrations, but if the celebration appears
  /// on a different year, the key is the same
  char eventKey[128];  // should be less brittle than "name" as it isn't used
                        // for display purposes
  int rank;
  enum LitColor color;
  char title[256];
  char subtitle[128];
  char gospelRef[64];
  char *gospelText;
  char *readingsURL;
};

bool lit_get_celebration(sqlite3 *db, uint64_t cal_id,
                                 int64_t epochSeconds,
                                 struct LitCelebration *outCel,
                                 struct LitError **outErr);

bool lit_get_min_and_max(sqlite3 *db, uint64_t cal_id, int64_t *outMin,
                                 int64_t *outMax, struct LitError **outErr);

//**ACTUALLY THERE IS NO NEED FOR THIS NEW DATA STRUCTURE, JUST PUT THE DATE IN THE CELEBRATION STRUCT AND CALL IT A DAY**//
struct LitCelebrationKey {
  struct LitCelebration *celebration;
  int64_t epochSeconds;
}

bool lit_all_celebrations(sqlite3 *db,
   struct LitCelebrationKey **outCelebrations, struct LitError **outErr);
//{ impl:
  // get all celebrations from sqlite
  // with the count, malloc result
  //LitCelebrationKey result[] = malloc...
  // end with *outCelebrations = result;
  // return true
  //
  // call this function like so
  // struct LitCelebrationKey allCelebrations[] = {}; // this is proper 0-init right?
  // struct LitError *err = {};
  // if (!lit_all_celebrations(db, &allCelebrations, &err)) {
  // report error
  // }
  // this'll be called from ObjC, though
//}

#endif /* LITDB_H */
