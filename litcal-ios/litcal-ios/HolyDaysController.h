//
//  HolyDaysController.h
//  litcal-ios
//
//  Created by James Hudon on 4/2/24.
//

#import <UIKit/UIKit.h>

@interface HolyDay : NSObject
@property (strong, nonatomic) NSDate *date;
@property (strong, nonatomic) NSString *name;
- (NSNumber*)toEpochSeconds;
@end

@protocol HolyDaysControllerDelegate <NSObject>
- (void)holyDaySelected:(HolyDay*)hd;
@end

@interface HolyDaysController : UIViewController
@property (weak, nonatomic) id<HolyDaysControllerDelegate> delegate;
@end
