//
// Created by James Hudon on 4/7/24.
//

#ifndef LITDB_DATES_H
#define LITDB_DATES_H

#include <time.h>

/// Corresponds to the 00:00 time boundary of the user's "today" as it were in UTC.
///
/// For example, if the user's current date is October 11, 10:15PM PDT (-7 offset from GMT),
/// then the result will be 1665446400 seconds from 1970-01-01 00:00 UTC.
time_t lit_start_of_today_seconds(void);

#endif //LITDB_DATES_H
