//
//  HolyDaysController.m
//  litcal-ios
//
//  Created by James Hudon on 4/2/24.
//

#import "HolyDaysController.h"
#import "dates.h"

@interface HolyDay : NSObject
@property (strong, nonatomic) NSDate *date;
@property (strong, nonatomic) NSString *name;
@end

@implementation HolyDay
- (instancetype)initWithName:(NSString *)name date:(NSDate*)date {
	self = [super init];
	if (self) {
		_name = name;
		_date = date;
	}
	return self;
}
@end


@interface HolyDaysController () <UITableViewDataSource>
@property (strong, nonatomic) NSDictionary *holyDays;
@property (strong, nonatomic) NSArray *orderedKeys;
@property (strong, nonatomic) NSDateFormatter *dateFormatter;
@end

@implementation HolyDaysController
- (IBAction)dismissModal:(id)sender {
	[self dismissViewControllerAnimated:YES completion:nil];
}

- (nonnull UITableViewCell *)tableView:(nonnull UITableView *)tableView cellForRowAtIndexPath:(nonnull NSIndexPath *)indexPath { 
	UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"dayCell"];
	NSString *key = [self orderedKeys][[indexPath section]];
	HolyDay *d = [[self holyDays] objectForKey:key][[indexPath row]];
	NSString *dateStr = [[self dateFormatter] stringFromDate:[d date]];
	NSString *txt = [NSString stringWithFormat:@"%@ - %@", dateStr, [d name]];

	UILabel *lbl = [cell viewWithTag:1];
	UIFont *boldFont = [UIFont fontWithName:@"EuclidSquare-SemiBold" size:14.0];
	UIFont *font = [UIFont fontWithName:@"EuclidSquare-Regular" size:14.0];
	NSInteger splitIndex = MIN([dateStr length], [txt length]);
	NSMutableAttributedString *attributedString = [[NSMutableAttributedString alloc] initWithString:txt];
	[attributedString addAttribute:NSFontAttributeName value:boldFont range:NSMakeRange(0, splitIndex)];
	[attributedString addAttribute:NSFontAttributeName value:font range:NSMakeRange(splitIndex, txt.length - splitIndex)];
	[lbl setAttributedText:attributedString];

	return cell;
}

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
	return [[self orderedKeys] count];
}

- (NSInteger)tableView:(nonnull UITableView *)tableView numberOfRowsInSection:(NSInteger)section { 
	NSString *sectionKey = [self orderedKeys][section];
	return [[[self holyDays] objectForKey:sectionKey] count];
}

- (NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section {
	return [self orderedKeys][section];
}

- (void)viewDidLoad {
	[self setDateFormatter:makeDateFormatter()];
	[[self dateFormatter] setDateFormat:@"MMM d"];


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
