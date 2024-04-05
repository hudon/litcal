//
//  colors.m
//  litcal-ios
//
//  Created by James Hudon on 4/3/24.
//

#import "colors.h"

UIColor* uiColorFromLitColor(enum lit_color c) {
	switch (c) {
		case LIT_BLACK:
			return [UIColor allSoulsColor];
		case LIT_GREEN:
			return [UIColor figTreeColor];
		case LIT_RED:
			return [UIColor passionColor];
		case LIT_WHITE:
			return [UIColor lilyColor];
		case LIT_VIOLET:
			return [UIColor wineColor];
		case LIT_ROSE:
			return [UIColor matrimonyColor];
		case LIT_GOLD:
			return [UIColor chaliceColor];
		case LIT_SILVER:
			return [UIColor ashesColor];
		default:
			break;
	}
	return nil;
}


@implementation UIColor (CustomColors)
+ (UIColor *)allSoulsColor {
    return [UIColor colorNamed:@"Color_AllSouls"];
}

+ (UIColor *)ashesColor {
    return [UIColor colorNamed:@"Color_Ashes"];
}

+ (UIColor *)chaliceColor {
    return [UIColor colorNamed:@"Liturgicolor_Chalice"];
}

+ (UIColor *)disabledBtnColor {
    return [UIColor colorNamed:@"Color_btn_disabled_bg"];
}

+ (UIColor *)figTreeColor {
    return [UIColor colorNamed:@"Liturgicolor_FigTree"];
}

+ (UIColor*)grayBg {
	return [UIColor colorNamed:@"Color_gray_bg"];
}

+ (UIColor *)lilyColor {
    return [UIColor colorNamed:@"Liturgicolor_Lily"];
}

+ (UIColor *)litSelectionColor {
    return [UIColor colorNamed:@"Color_selection"];
}

+ (UIColor *)matrimonyColor {
    return [UIColor colorNamed:@"Liturgicolor_Matrimony"];
}

+ (UIColor *)ourLadyColor {
    return [UIColor colorNamed:@"Color_OurLady"];
}

+ (UIColor *)passionColor {
    return [UIColor colorNamed:@"Liturgicolor_Passion"];
}

+ (UIColor*)separatorColor {
	return [UIColor colorNamed:@"Color_separator"];
}

+ (UIColor*)textColor {
	return [UIColor colorNamed:@"Color_text"];
}

+ (UIColor*)whiteBorder {
	return [UIColor colorNamed:@"Color_white_border"];
}

+ (UIColor*)wineColor {
	return [UIColor colorNamed:@"Liturgicolor_Wine"];
}
@end
