//
//  dates.m
//  litcal-ios
//
//  Created by James Hudon on 4/2/24.
//

#import "dates_bridge.h"
#import "litdb.h"

NSTimeZone* makeTimeZone(void) {
	return [NSTimeZone timeZoneForSecondsFromGMT:0];
}

NSCalendar* makeGMTCalendar(void) {
	NSCalendar *cal = [NSCalendar currentCalendar];
	[cal setTimeZone:makeTimeZone()];
	return  cal;
}

NSNumber* makeTodaySeconds(void) {
	return [
		[NSNumber alloc]
		initWithLongLong:lit_start_of_today_seconds()
	];
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
