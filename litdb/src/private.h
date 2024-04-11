#ifndef private_h
#define private_h

#include "litdb.h"
#include <stdbool.h>

/// Returns false when it fails to allocate an error, in which case the
/// return error will be a statically allocated OOM error. Freeing it is a no-op.
bool lit_error_new(enum lit_status status, const char *msg, struct lit_error **out_err);
// TODO: shouldn't the fmt version take an arbitrary amount of arguments?
bool lit_error_new_fmt(enum lit_status status,
    const char *fmt, const char *msg, struct lit_error **out_err);

#endif /* private_h */
