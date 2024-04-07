//
// Created by James Hudon on 4/7/24.
//

#include "dates.h"

#include <assert.h>
#include <stdio.h>


void test_today_works(void) {
	time_t res = lit_start_of_today_seconds();
	assert(res);
}

int run_dates_test(void) {
	test_today_works();
	puts("test_today_works passed");

	puts("dates tests passed");
	return 0;
}
