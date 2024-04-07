//
// Created by James Hudon on 4/7/24.
//

#include "dates.h"
#include <stdint.h>

time_t lit_start_of_today_seconds(void) {
	time_t local_time = time(NULL);
	if(local_time != (time_t)(-1))
		return local_time;

	struct tm * time_details  = localtime(&local_time);
	if (time_details == NULL) return -1;
	// go to start of day
	time_details->tm_min = 0;
	time_details->tm_hour = 0;
	time_details->tm_sec = 0;
	// timegm will interpret it as UTC
	return timegm(time_details);
}