//
//  LitDB.m
//  litcal-ios
//
//  Created by James Hudon on 3/26/24.
//

#import "LitCelebrationBridge.h"

@interface LitCelebrationBridge ()
@end

NSString* fromCString(const char *str) {
    return [[NSString alloc] initWithCString:str encoding:NSASCIIStringEncoding];
}

@implementation LitCelebrationBridge

- (instancetype)initWithCLitCelebration:(struct lit_celebration)litCel {
    if (self = [super init]) {
        [self setRank:litCel.rank];
        [self setTitle:fromCString(litCel.title)];
        [self setSubtitle:fromCString(litCel.subtitle)];
        [self setEventKey:fromCString(litCel.event_key)];
        [self setGospelRef:fromCString(litCel.gospel_ref)];
        [self setGospelText:fromCString(litCel.gospel_text)];
        [self setReadingsURL:fromCString(litCel.readings_url)];
        [self setEpochSeconds:litCel.epoch_seconds];
        [self setColor:litCel.color];
    }
    return self;
}

@end