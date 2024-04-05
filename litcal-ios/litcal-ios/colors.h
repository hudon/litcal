//
//  colors.h
//  litcal-ios
//
//  Created by James Hudon on 4/3/24.
//



#import "litdb.h"
#import <UIKit/UIKit.h>

extern NSString *kColLabel;
extern NSString *kColBtnDisabled;
extern NSString *kColText;

extern NSString *kColAllSouls;
extern NSString *kColAshes;
extern NSString *kColDove;
extern NSString *kColStellaMaris;
extern NSString *kColChalice;
extern NSString *kColFigTree;
extern NSString *kColLily;
extern NSString *kColMatrimony;
extern NSString *kColOurLady;
extern NSString *kColPassion;
extern NSString *kColWine;

UIColor* uiColorFromLitColor(enum lit_color c);

@interface UIColor (CustomColors)
@property (class, nonatomic, readonly) UIColor *litSelectionColor;
@property (class, nonatomic, readonly) UIColor *whiteBorder;
@property (class, nonatomic, readonly) UIColor *grayBg;
@property (class, nonatomic, readonly) UIColor *textColor;
@property (class, nonatomic, readonly) UIColor *separatorColor;
@end
