//
//  colors.h
//  litcal-ios
//
//  Created by James Hudon on 4/3/24.
//



#import "litdb.h"
#import <UIKit/UIKit.h>

UIColor* uiColorFromLitColor(enum lit_color c);

@interface UIColor (CustomColors)
@property (class, nonatomic, readonly) UIColor *allSoulsColor;
@property (class, nonatomic, readonly) UIColor *ashesColor;
@property (class, nonatomic, readonly) UIColor *chaliceColor;
@property (class, nonatomic, readonly) UIColor *disabledBtnColor;
@property (class, nonatomic, readonly) UIColor *figTreeColor;
@property (class, nonatomic, readonly) UIColor *grayBg;
@property (class, nonatomic, readonly) UIColor *lilyColor;
@property (class, nonatomic, readonly) UIColor *litSelectionColor;
@property (class, nonatomic, readonly) UIColor *matrimonyColor;
@property (class, nonatomic, readonly) UIColor *ourLadyColor;
@property (class, nonatomic, readonly) UIColor *passionColor;
@property (class, nonatomic, readonly) UIColor *separatorColor;
@property (class, nonatomic, readonly) UIColor *textColor;
@property (class, nonatomic, readonly) UIColor *whiteBorder;
@property (class, nonatomic, readonly) UIColor *wineColor;
@end
