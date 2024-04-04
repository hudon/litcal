//
//  colors.h
//  litcal-ios
//
//  Created by James Hudon on 4/3/24.
//

#ifndef colors_h
#define colors_h

#import "litdb.h"
#import <UIKit/UIKit.h>

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

#endif /* colors_h */
