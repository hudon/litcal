//
//  DotView.m
//  litcal-ios
//
//  Created by James Hudon on 4/5/24.
//

#import "DotView.h"
#import "colors.h"

@implementation DotView

- (void)commonInit {
	[self setClipsToBounds:YES];
}

- (instancetype)initWithFrame:(CGRect)frame {
	if (self = [super initWithFrame:frame]) {
		[self commonInit];
	}
	return self;
}

- (instancetype)initWithCoder:(NSCoder *)coder {
	if (self = [super initWithCoder:coder]) {
		[self commonInit];
	}
	return self;
}

- (void)layoutSubviews {
	[super layoutSubviews];
	[[self layer] setCornerRadius:[self frame].size.width / 2];
	// color will be wrong for non-white events but that's OK
	// because the border width will be 0
	// This is set in layoutSubviews so it can run any time the
	// user changes light/dark mode
	[[self layer] setBorderColor:[[UIColor whiteBorder] CGColor]];
}

-(void)setCelebration:(LitCelebrationBridge*)cel {
	[[self layer] setBorderWidth:0.0];
	[self setBackgroundColor:nil];
	if ([cel rank] <= 11) {
		[self setBackgroundColor:uiColorFromLitColor([cel color])];
		if ([cel color] == LIT_WHITE) {
			[[self layer] setBorderWidth:1.0];
		}
	}
}

@end
