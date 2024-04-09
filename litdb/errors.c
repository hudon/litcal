#include "private.h"

#include <stddef.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

bool lit_error_new(enum lit_status status, const char *msg, struct lit_error **out_err) {
	if (out_err == NULL) {
		return true;
	}
	struct lit_error *err = malloc(sizeof *err);
	if (!err) {
		// TODO: return a static no_mem error just for this purpose
		fprintf(stderr, "Failed to malloc when creating an error. Exiting.\n");
		exit(-1);
	}
	err->status = status;
	(void)strlcpy(err->message, msg, sizeof(err->message));
	*out_err = err;
	return true;
}

bool lit_error_new_fmt(enum lit_status status,
		const char *fmt, const char *msg,
		struct lit_error **out_err) {
	char buff[BUFSIZ];
	(void)snprintf(buff, sizeof(buff), fmt, msg);
	return lit_error_new(LIT_ERROR, buff, out_err);
}


void lit_error_free(struct lit_error *err) {
	if (err != NULL) free(err);	
}
