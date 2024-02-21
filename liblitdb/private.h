#ifndef private_h
#define private_h

#include "liblitdb.h"

void lit_error_new(struct LitStatus status, const char *msg, struct LitError **outErr);

#endif /* private_h */
