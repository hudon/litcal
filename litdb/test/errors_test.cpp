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
	lit_error_free(err);
}

TEST_CASE("freeing null error doesn't fail", "[errors]") {
	lit_error_free(NULL);
}

TEST_CASE("valid error is returned even when OOM", "[errors]") {
	SKIP("malloc must be shadowed/mocked for this test to work");
	struct lit_error *err = nullptr;
	REQUIRE(!lit_error_new(LIT_ERROR, "foo", &err));
	REQUIRE(err->status == LIT_NO_MEM);
	REQUIRE(!strcmp("Failed to allocate memory when creating an error.", err->message));
	lit_error_free(err);
}

