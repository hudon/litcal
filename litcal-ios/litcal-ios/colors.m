//
//  colors.m
//  litcal-ios
//
//  Created by James Hudon on 4/3/24.
//

#import "colors.h"

NSString *kColLabel = @"Color_label";
NSString *kColBtnDisabled = @"Color_btn_disabled_bg";
NSString *kColText = @"Color_text";

NSString *kColAllSouls = @"Color_AllSouls";
NSString *kColAshes = @"Color_Ashes";
NSString *kColDove = @"Color_Dove";
NSString *kColStellaMaris = @"Color_StellaMaris";
NSString *kColChalice = @"Liturgicolor_Chalice";
NSString *kColFigTree = @"Liturgicolor_FigTree";
NSString *kColLily = @"Liturgicolor_Lily";
NSString *kColMatrimony = @"Liturgicolor_Matrimony";
NSString *kColOurLady = @"Color_OurLady";
NSString *kColPassion = @"Liturgicolor_Passion";
NSString *kColWine = @"Liturgicolor_Wine";

UIColor* uiColorFromLitColor(enum lit_color c) {
	NSString *chosen;
	switch (c) {
		case LIT_BLACK:
			chosen = kColAllSouls;
			break;
		case LIT_GREEN:
			chosen = kColFigTree;
			break;
		case LIT_RED:
			chosen = kColPassion;
			break;
		case LIT_WHITE:
			chosen = kColLily;
			break;
		case LIT_VIOLET:
			chosen = kColWine;
			break;
		case LIT_ROSE:
			chosen = kColMatrimony;
			break;
		case LIT_GOLD:
			chosen = kColChalice;
			break;
		case LIT_SILVER:
			chosen = kColAshes;
			break;
		default:
			break;
	}
	return [UIColor colorNamed:chosen];
}


@implementation UIColor (CustomColors)
+ (UIColor *)litSelectionColor {
    return [UIColor colorNamed:@"Color_selection"];
}

+ (UIColor*)whiteBg {
	return [UIColor colorNamed:@"Color_white_bg"];
}
@end
