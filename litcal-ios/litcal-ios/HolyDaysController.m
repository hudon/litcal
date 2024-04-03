//
//  HolyDaysController.m
//  litcal-ios
//
//  Created by James Hudon on 4/2/24.
//

#import "HolyDaysController.h"
#import "dates.h"
#import "colors.h"

// should match the margin in Interface Builder for consistency
static const NSInteger leftMargin = 11;


@implementation HolyDay
- (instancetype)initWithName:(NSString *)name date:(NSDate*)date {
	self = [super init];
	if (self) {
		_name = name;
		_date = date;
	}
	return self;
}

- (NSNumber*)toEpochSeconds {
	return [NSNumber numberWithDouble:[[self date] timeIntervalSince1970]];
}
@end


@interface HolyDaysController () <UITableViewDataSource,UITableViewDelegate>
@property (strong, nonatomic) NSDictionary *holyDays;
@property (strong, nonatomic) NSArray *orderedKeys;
@property (strong, nonatomic) NSDateFormatter *dateFormatter;
@property (strong, nonatomic) UIFont *font;
@property (strong, nonatomic) UIFont *boldFont;
@end

@implementation HolyDaysController

- (IBAction)dismissModal:(id)sender {
	[self dismissViewControllerAnimated:YES completion:nil];
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath*)indexPath {
	NSString *key = [self orderedKeys][[indexPath section]];
	HolyDay *d = [[self holyDays] objectForKey:key][[indexPath row]];
	[[self delegate] holyDaySelected:d];
	[self dismissViewControllerAnimated:YES completion:nil];
}

- (UIView *)tableView:(UITableView *)tableView
viewForHeaderInSection:(NSInteger)section {
	UILabel *lbl = [[UILabel alloc] init];
	[lbl setFont:[self font]];
	[lbl setTextColor:[UIColor colorNamed:kColAshes]];
	[lbl setTextColor:[UIColor grayColor]];
	[lbl setText:[self orderedKeys][section]];
	[lbl setBackgroundColor:[UIColor colorNamed:kColDove]];

	UIView *header = [[UIView alloc] init];
	[lbl setTranslatesAutoresizingMaskIntoConstraints:NO];
	[header addSubview:lbl];
	[NSLayoutConstraint activateConstraints:@[
		[[lbl leadingAnchor]
			constraintEqualToAnchor:[header leadingAnchor]
		 	constant:leftMargin],
		[[lbl trailingAnchor]
			constraintEqualToAnchor:[header trailingAnchor]
		 	constant:0],
		[[lbl topAnchor]
			constraintEqualToAnchor:[header topAnchor ]
		 	constant:0],
		[[lbl bottomAnchor]
			constraintEqualToAnchor:[header bottomAnchor]
		 	constant:-6]
	]];
	return header;
}

- (void)roundCornersForCell:(UITableViewCell *)cell corners:(UIRectCorner)corners {
	UIBezierPath *maskPath = [
		UIBezierPath
		bezierPathWithRoundedRect:cell.bounds
		byRoundingCorners:corners
		cornerRadii:CGSizeMake(10.0, 10.0)
	];
	CAShapeLayer *maskLayer = [CAShapeLayer layer];
	[maskLayer setFrame:[cell bounds]];
	[maskLayer setPath:[maskPath CGPath]];
	[[cell layer] setMask:maskLayer];
}

// We need to round corners here instead of the cellForRowAtIndexPath method
// because the cell's bound needs to be decided by Auto Layout before we
// round corners and that method happens before AL runs
- (void)tableView:(UITableView *)tableView
	willDisplayCell:(UITableViewCell *)cell
	forRowAtIndexPath:(NSIndexPath *)indexPath
{
	// We only round the first and the last row
	NSInteger totalRows = [tableView numberOfRowsInSection:indexPath.section];
	if (indexPath.row == 0) {
		[self roundCornersForCell:cell corners:UIRectCornerTopLeft | UIRectCornerTopRight];
	} else if (indexPath.row == totalRows - 1) {
		[self roundCornersForCell:cell corners:UIRectCornerBottomLeft | UIRectCornerBottomRight];
	} else {
		[[cell layer] setMask:nil];
	}
}

- (nonnull UITableViewCell *)tableView:(nonnull UITableView *)tableView
	cellForRowAtIndexPath:(nonnull NSIndexPath *)indexPath
{
	UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"dayCell"];
	NSString *key = [self orderedKeys][[indexPath section]];
	HolyDay *d = [[self holyDays] objectForKey:key][[indexPath row]];
	NSString *dateStr = [[self dateFormatter] stringFromDate:[d date]];
	NSString *txt = [NSString stringWithFormat:@"%@ - %@", dateStr, [d name]];

	UILabel *lbl = [cell viewWithTag:1];
	NSInteger splitIndex = MIN([dateStr length], [txt length]);
	NSMutableAttributedString *attributedString = 
		[[NSMutableAttributedString alloc] initWithString:txt];
	[attributedString
	 	addAttribute:NSFontAttributeName
		value:[self boldFont]
		range:NSMakeRange(0, splitIndex)];
	[attributedString
		addAttribute:NSFontAttributeName
	 	value:[self font]
		range:NSMakeRange(splitIndex, txt.length - splitIndex)];
	[lbl setAttributedText:attributedString];

	// For an unknown reason, UIKit doesn't respect this setting from Interface Builder,
	// so we need to set it here
	[[cell contentView] setPreservesSuperviewLayoutMargins:NO];

	// We add separators programmatically because we don't want the section top and
	// bottom cells to get separators
	UIView *separatorView = [cell viewWithTag:100];
	[separatorView removeFromSuperview];
	if (indexPath.row != 0) {
		UIView *customSeparator = [
			[UIView alloc]
			initWithFrame:CGRectMake(
				leftMargin,
				0,
				CGRectGetWidth([tableView frame]) - leftMargin * 2, 1
			)
		];
		customSeparator.backgroundColor = [UIColor colorNamed:kColDove];
		customSeparator.tag = 100;
		[cell addSubview:customSeparator];
	}

	return cell;
}

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
	return [[self orderedKeys] count];
}

- (NSInteger)tableView:(nonnull UITableView *)tableView numberOfRowsInSection:(NSInteger)section { 
	NSString *sectionKey = [self orderedKeys][section];
	return [[[self holyDays] objectForKey:sectionKey] count];
}

- (void)viewDidLoad {
	[self setDateFormatter:makeDateFormatter()];
	[[self dateFormatter] setDateFormat:@"MMM d"];
	[self setFont:[UIFont fontWithName:@"EuclidSquare-Regular" size:14.0]];
	[self setBoldFont:[UIFont fontWithName:@"EuclidSquare-SemiBold" size:14.0]];

	NSArray *days2024 = @[
		[
			[HolyDay alloc]
			initWithName:@"The Assumption of the Blessed Virgin Mary"
			 date:makeDateFromComponents(2024, 8, 15)
		],
		[
			[HolyDay alloc]
			initWithName:@"All Saints"
			date:makeDateFromComponents(2024, 11, 1)
		]
	];
	[self setHolyDays:[
		[NSDictionary alloc]
		initWithObjects:@[days2024]
		forKeys:@[@"2024"]
	]];
	[self setOrderedKeys:@[@"2024"]];
}

@end
