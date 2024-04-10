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
	REQUIRE(res > 1712707199); // 2024-04-09
	REQUIRE(res < 2028319632); // 2034-04-10... test will fail in 2034
	REQUIRE(res % (60 * 60 * 24) == 0); // res is at day boundary
}
