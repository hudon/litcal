//
//  dates.m
//  litcal-ios
//
//  Created by James Hudon on 4/2/24.
//

#import "dates.h"

NSTimeZone* makeTimeZone(void) {
	return [NSTimeZone timeZoneForSecondsFromGMT:0];
}

NSCalendar* makeCalendar(void) {
	NSCalendar *cal = [NSCalendar currentCalendar];
	[cal setTimeZone:makeTimeZone()];
	return  cal;
}

NSNumber* makeTodaySeconds(void) {
	NSCalendar *cal = makeCalendar();
	long long epochSeconds =
		[[cal startOfDayForDate:[NSDate date]] timeIntervalSince1970];
	return [[NSNumber alloc] initWithLongLong:epochSeconds];
}

NSDate* makeDateFromComponents(int year, int month, int day) {
	NSDateComponents *comps = [[NSDateComponents alloc] init];
	[comps setYear:year];
	[comps setMonth:month];
	[comps setDay:day];
	return [makeCalendar() dateFromComponents:comps];
}

NSDateFormatter* makeDateFormatter(void) {
	NSDateFormatter *df = [[NSDateFormatter alloc] init];
	[df setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"en_US_POSIX"]];
	[df setTimeZone:makeTimeZone()];
	return df;
}
