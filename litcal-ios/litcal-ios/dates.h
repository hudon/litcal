//
//  dates.h
//  litcal-ios
//
//  Created by James Hudon on 4/2/24.
//

#import <Foundation/Foundation.h>

NSTimeZone* makeTimeZone(void);
NSNumber* makeTodaySeconds(void);
NSDate* makeDateFromEpochSeconds(NSNumber* e);
NSDate* makeDateFromComponents(int year, int month, int day);
NSDateFormatter* makeDateFormatter(void);
