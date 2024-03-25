#ifndef private_h
#define private_h

#include "liblitdb.h"
#include <stdbool.h>

bool lit_error_new(enum lit_status status, const char *msg, struct lit_error **out_err);
// TODO: shouldn't the fmt version take an arbitrary amount of arguments?
bool lit_error_new_fmt(enum lit_status status,
    const char *fmt, const char *msg, struct lit_error **out_err);

#endif /* private_h */
