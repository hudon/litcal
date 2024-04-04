//
//  LitDB.m
//  litcal-ios
//
//  Created by James Hudon on 3/26/24.
//

#import "LitCelebrationBridge.h"
#import "../dates.h"

@interface LitCelebrationBridge ()
@end

NSString* fromCString(const char *str) {
	return [[NSString alloc]
		initWithCString:str encoding:NSASCIIStringEncoding];
}

NSString* fromUTF8CString(const char *str) {
	return [[NSString alloc]
		initWithCString:str encoding:NSUTF8StringEncoding];
}

@implementation LitCelebrationBridge

- (instancetype)initWithCLitCelebration:(struct lit_celebration)litCel {
	if (self = [super init]) {
		[self setRank:litCel.rank];
		[self setTitle:fromUTF8CString(litCel.title)];
		[self setSubtitle:fromCString(litCel.subtitle)];
		[self setEventKey:fromCString(litCel.event_key)];
		[self setGospelRef:fromCString(litCel.gospel_ref)];
		[self setGospelText:fromUTF8CString(litCel.gospel_text)];
		[self setReadingsURL:fromCString(litCel.readings_url)];
		[self setEpochSeconds:litCel.epoch_seconds];
		[self setColor:litCel.color];
		[self setSeason:fromCString(litCel.season)];
	}
	return self;
}

- (NSDate*)date {
	return makeDateFromEpochSeconds(
		[NSNumber numberWithInteger:[self epochSeconds]]);
}

@end
