//
// Created by James Hudon on 4/9/24.
//
extern "C" {
#include "dates.h"
}

#include <catch2/catch_test_macros.hpp>

TEST_CASE( "today_works", "[dates]" ) {
	time_t res = lit_start_of_today_seconds();
	REQUIRE( res );
}
