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

NSCalendar* makeGMTCalendar(void) {
	NSCalendar *cal = [NSCalendar currentCalendar];
	[cal setTimeZone:makeTimeZone()];
	return  cal;
}

NSNumber* makeTodaySeconds(void) {
	NSDate *d = [NSDate date];
	NSTimeInterval offset = (NSTimeInterval)[
		[NSTimeZone localTimeZone]
		secondsFromGMTForDate:d
	];
	NSDate *utcDate = [d dateByAddingTimeInterval:offset];

	long long epochSeconds = [
		[makeGMTCalendar() startOfDayForDate:utcDate]
		timeIntervalSince1970
	];
	return [[NSNumber alloc] initWithLongLong:epochSeconds];
}

NSDate* makeDateFromEpochSeconds(NSNumber* e) {
	return [[NSDate alloc] initWithTimeIntervalSince1970:[e doubleValue]];
}

NSDate* makeDateFromComponents(int year, int month, int day) {
	NSDateComponents *comps = [[NSDateComponents alloc] init];
	[comps setYear:year];
	[comps setMonth:month];
	[comps setDay:day];
	return [makeGMTCalendar() dateFromComponents:comps];
}

NSDateFormatter* makeDateFormatter(void) {
	NSDateFormatter *df = [[NSDateFormatter alloc] init];
	[df setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"en_US_POSIX"]];
	[df setTimeZone:makeTimeZone()];
	return df;
}

NSDateFormatter* makeDateFormatterWithFormat(NSString*f) {
	NSDateFormatter *df = makeDateFormatter();
	[df setDateFormat:f];
	return df;
}
