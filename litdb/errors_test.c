#include "private.h"

#include <assert.h>
#include <stddef.h>
#include <stdio.h>
#include <stdbool.h>
#include <string.h>

void test_new_err(void) {
	struct lit_error *err = NULL;
	char *msg = "beep boop";
	assert(lit_error_new(LIT_ERROR, msg, &err));
	assert(err->status == LIT_ERROR);
	assert(!strcmp(msg, err->message));
}

void test_free_err(void) {
}

int run_errors_test(void) {
	test_new_err();
	puts("test_new_err passed");

	test_free_err();
	puts("test_free_err passed");

	puts("errors tests passed");
	return 0;
}
