//
//  GradientView.m
//  litcal-ios
//
//  Created by James Hudon on 4/3/24.
//

#import "GradientView.h"

@implementation GradientView


- (void)setColor:(UIColor *)color {
	_color = color;
	[self layoutSubviews];
}

- (void)layoutSubviews {
	[super layoutSubviews];

	UIColor *col = [self color];
	if (col == nil) {
		col = [UIColor whiteColor];
	}

	CAGradientLayer *gradientLayer = [CAGradientLayer layer];

	CGFloat startOpacity = 0.3;
	if (@available(iOS 12.0, *)) {
		if ([[self traitCollection] userInterfaceStyle] == UIUserInterfaceStyleDark) {
			startOpacity = 0.25;
		}
	}

	[gradientLayer setFrame:[self bounds]];
	gradientLayer.colors = @[
		(id)[[col colorWithAlphaComponent:startOpacity] CGColor],
		(id)[[col colorWithAlphaComponent:0.0] CGColor]
	];

	[gradientLayer setStartPoint:CGPointMake(0.5, 0.0)];
	[gradientLayer setEndPoint:CGPointMake(0.5, 1.0)];

	id first = [[[self layer] sublayers] firstObject];
	if ([first isKindOfClass:[CAGradientLayer class]]) {
		[[self layer] replaceSublayer:first with:gradientLayer];
	} else {
		[[self layer] insertSublayer:gradientLayer atIndex:0];
	}
}

@end
