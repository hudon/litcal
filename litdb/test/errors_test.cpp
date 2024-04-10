#include <cstring>

extern "C" {
#include "private.h"
}

#include <catch2/catch_test_macros.hpp>

TEST_CASE( "new error", "[errors]" ) {
	struct lit_error *err = nullptr;
	char msg[] = "beep boop";
	REQUIRE(lit_error_new(LIT_ERROR, msg, &err));
	REQUIRE(err->status == LIT_ERROR);
	REQUIRE(!strcmp(msg, err->message));
}
