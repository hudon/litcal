//
//  CircularView.m
//  litcal-ios
//
//  Created by James Hudon on 2/3/24.
//

#import "CircularView.h"
#import <Foundation/Foundation.h>

@implementation CircularView

- (void)layoutSubviews {
    [super layoutSubviews];
    [[self layer] setCornerRadius:[self bounds].size.width / 2];
    [[self layer] setMasksToBounds:YES];
}

@end
