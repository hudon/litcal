//
//  LitDB.h
//  litcal-ios
//
//  Created by James Hudon on 3/26/24.
//

#ifndef LitCelebrationBridge_h
#define LitCelebrationBridge_h

#include "litdb.h"
#import <Foundation/Foundation.h>

// Having a boxed lit_celebration gives us automatic memory management
@interface LitCelebrationBridge : NSObject
@property NSString *eventKey;
@property NSInteger rank;
@property NSString *title;
@property NSString *subtitle;
@property NSString *gospelRef;
@property NSString *gospelText;
@property NSString *readingsURL;
@property NSInteger epochSeconds;
@property enum lit_color color;

- (instancetype)initWithCLitCelebration:(struct lit_celebration)litCel;
- (NSDate*)date;
@end

#endif /* LitCelebrationBridge_h */
