//
//  ViewController.m
//  litcal-ios
//
//  Created by James Hudon on 2/1/24.
//

#import "ViewController.h"
#import "HolyDaysController.h"
#import "litdb.h"
#import "litdbBridge/LitCelebrationBridge.h"
#import "dates.h"
#import "colors.h"
#import "GradientView.h"

static const NSTimeInterval kSecondsPerDay = 86400;
static NSString *kFontName = @"EuclidSquare-Regular";

@interface ViewController () <UIScrollViewDelegate, HolyDaysControllerDelegate>

@property (weak, nonatomic) IBOutlet UICollectionView *collView;
@property (weak, nonatomic) IBOutlet UILabel *gospelText;
@property (weak, nonatomic) IBOutlet UILabel *monthLabel;
@property (weak, nonatomic) IBOutlet UIButton *todayBtn;
@property (weak, nonatomic) IBOutlet UIImageView *chevron;
@property (weak, nonatomic) IBOutlet UIStackView *drawer;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *scrollViewTopConstraint;
@property (weak, nonatomic) IBOutlet GradientView *gradient;
@property (weak, nonatomic) IBOutlet UIImageView *img;
@property (weak, nonatomic) IBOutlet UIStackView *popupStack;
@property (weak, nonatomic) IBOutlet UIButton *link;

@property (strong, nonatomic) UICollectionViewDiffableDataSource *dataSource;
@property (strong, nonatomic) NSDictionary *celebrations;
@property (strong, nonatomic) NSNumber *selectedKey;
@property (strong, nonatomic) NSDateFormatter *dateFormatter;
@property (strong, nonatomic) NSURL *gospelURL;
@property (nonatomic) sqlite3 *db;
@property (nonatomic) NSUInteger minEpochSeconds;
@property (nonatomic) NSUInteger maxEpochSeconds;
@property (nonatomic) BOOL shouldShowDrawer;

- (void)scrollTo:(NSNumber*)key;

@end


@implementation ViewController

- (LitCelebrationBridge*)selectedCelebration {
	return [[self celebrations] objectForKey:[self selectedKey]];
}

- (void)highlightCell:(UICollectionViewCell*)cell {
	[[cell viewWithTag:2] setBackgroundColor:[UIColor colorNamed:kColStellaMaris]];
	[[cell viewWithTag:2] setTextColor:[UIColor colorNamed:kColLily]];
	[[cell viewWithTag:3] setHidden:YES];
}

- (void)unHighlightCell:(UICollectionViewCell*)cell {
	[[cell viewWithTag:2] setBackgroundColor:nil];
	[[cell viewWithTag:2] setTextColor:[UIColor colorNamed:kColStellaMaris]];
	[[cell viewWithTag:3] setHidden:NO];
}

- (void)setSelectedKey:(NSNumber *)selectedKey {
	if ([_selectedKey isEqual:selectedKey]) {
		return;
	}

	NSNumber *today = makeTodaySeconds();
	if ([today isEqual:selectedKey]) {
		[[self todayBtn] setBackgroundColor:[UIColor colorNamed:kColDove]];
		[[self todayBtn] setTintColor:[UIColor colorNamed:kColAshes]];
	} else {
		[[self todayBtn] setBackgroundColor:[UIColor colorNamed:kColOurLady]];
		[[self todayBtn] setTintColor:[UIColor colorNamed:kColDove]];
	}

	NSIndexPath *oldIP = [[self dataSource] indexPathForItemIdentifier:_selectedKey];
	UICollectionViewCell *oldCell = [[self collView] cellForItemAtIndexPath:oldIP];
	[self unHighlightCell:oldCell];
	UILabel *subtitle = [[self popupStack] viewWithTag:3];
	[subtitle removeFromSuperview];

	_selectedKey = selectedKey;

	NSIndexPath *newIP = [[self dataSource] indexPathForItemIdentifier:_selectedKey];
	[self highlightCell:(UICollectionViewCell *)[[self collView] cellForItemAtIndexPath:newIP]];
	LitCelebrationBridge *cel = [self selectedCelebration];
	// image updates
	{
		NSString *imgName = @"hero_ordinary_time";
		NSString *s = [cel season];
		if ([s isEqual:@"Advent"]) {
			imgName = @"hero_advent";
		} else if ([s isEqual:@"Christmas"]) {
			imgName = @"hero_christmas";
		} else if ([s isEqual:@"Lent"]) {
			imgName = @"hero_lent";
		} else if ([s isEqual:@"Easter"]) {
			imgName = @"hero_easter";
		}
		switch ([cel rank]) {
			case 7: case 8: case 10: case 11: case 12:
				imgName = @"hero_saints";
		}
		if ([[cel title] isEqual:@"Saturday Memorial of the Blessed Virgin Mary"]) {
			imgName = @"hero_bvm";
		}
		NSString *key = [cel eventKey];
		NSArray *bvms = @[@"MaryMotherChurch", @"QueenshipMary", @"LadyLoreto",
			@"LadyLourdes", @"LadyFatima", @"LadyMountCarmel", @"LadySorrows",
			@"LadyRosary", @"LadyGuadalupe" ];
		for (id e in bvms) {
			if ([key isEqual:e]) {
				imgName = @"hero_bvm";
				break;
			}
		}
		if ([key isEqual:@"StMaryMagdalene"]) {
			imgName = @"hero_mary_magdalene";
		} else if ([key isEqual:@"GoodFri"]) {
			imgName = @"hero_good_friday";
		} else if ([key isEqual:@"EasterVigil"] || [key isEqual:@"HolySaturday"]) {
			imgName = @"hero_holy_saturday";
		} else if ([key isEqual:@"Easter"]) {
			imgName = @"hero_easter";
		} else if ([key isEqual:@"Pentecost"]) {
			imgName = @"hero_pentecost";
		}

		[[self img] setImage:[UIImage imageNamed:imgName]];
	}
	// popup updates
	{
		UILabel *date = [[self popupStack] viewWithTag:1];
		enum lit_color c = [cel color];
		UIColor *uc = uiColorFromLitColor(c);
		if (c == LIT_WHITE) {
			uc = [UIColor colorNamed:kColAshes];
		}
		[date setTextColor:uc];
		NSDateFormatter *df = [self dateFormatter];
		[df setDateFormat:@"MMM d, y"];
		[date setText:[NSString
			stringWithFormat:@"%@ · %@",
			[df stringFromDate:[cel date]],
			[cel season]
		]];

		[[[self popupStack] viewWithTag:2] setText:[cel title]];
		if (![[cel subtitle] isEqual:@""]) {
			UILabel *subtitle = [[UILabel alloc] init];
			[subtitle setTag:3];
			[subtitle setText:[cel subtitle]];
			[subtitle setFont:[UIFont fontWithName:kFontName size:14.0]];
			[subtitle setTextColor:[UIColor colorNamed:kColAshes]];
			[[self popupStack] addArrangedSubview:subtitle];
		}
	}
	[[self gospelText] setText:[cel gospelText]];
	[[self gradient] setColor:uiColorFromLitColor([cel color])];
	[self setGospelURL:[NSURL URLWithString:[cel readingsURL]]];
	[[self link]
		setTitle:[NSString stringWithFormat:@"  %@", [cel gospelRef]]
		forState:UIControlStateNormal];
}

- (void)scrollTo:(NSNumber*)key {
	// find date in the existing range of dates, as a percentage
	NSUInteger min = [self minEpochSeconds], max = [self maxEpochSeconds];
	CGFloat datePos =
		(CGFloat)([key longLongValue] - min) / (max - min);

	UICollectionViewFlowLayout *layout =
		(UICollectionViewFlowLayout*)[[self collView] collectionViewLayout];
	CGFloat scrollViewWidth = [[self collView] visibleSize].width;
	// The first operand is the distance from cell_first.x to cell_last.x. So if todayPosition=100%,
	// then x will be the X origin of the last cell
	CGFloat x = ([[self collView] contentSize].width - [layout itemSize].width) * datePos;
	// center today cell by moving x away from the center of
	// the scrollView width and away from the center of the cell
	x = x - scrollViewWidth / 2 + [layout itemSize].width / 2;

	// we give the rect a minimal arbitrary height to avoid UIKit ignoring our request
	CGRect r = CGRectMake(x, 0, scrollViewWidth, 1);
	[[self collView] scrollRectToVisible:r animated:YES];
}

-(void)holyDaySelected:(HolyDay*)hd {
	NSNumber *key = [hd toEpochSeconds];
	[self scrollTo:key];
	[self setSelectedKey:key];
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
	if ([segue.identifier isEqualToString:@"calendarTapSegue"]) {
		HolyDaysController *c = (HolyDaysController *)segue.destinationViewController;
		[c setDelegate:self];
	}
}

- (IBAction)handleLinkTap:(id)sender {
	NSURL *url = [self gospelURL];
	if ([[UIApplication sharedApplication] canOpenURL:url]) {
		[[UIApplication sharedApplication] openURL:url options:@{} completionHandler:nil];
	}
}

- (IBAction)handleTitleTap:(id)sender {
	BOOL shouldShow = ![self shouldShowDrawer];
	[self setShouldShowDrawer:shouldShow];

	// We want drawer to hide underneath above view as it slides out of view
	[[[self drawer] superview] sendSubviewToBack:[self drawer]];

	CGFloat drawerHeight = [[self drawer] frame].size.height;
	[[self drawer] layoutMargins];

	[[self scrollViewTopConstraint] setConstant:shouldShow ? 0.0 : -drawerHeight];
	[UIView animateWithDuration:0.25 animations:^{
		// force animated layout bc the constraints changed
		[[[self drawer] superview] layoutIfNeeded];
		[[self drawer] setAlpha:shouldShow ? 1.0 : 0.0];
		// Without the small offset, animations choose the shortest path,
		// but the shortest path to 180 deg can be clockwise or counter-clockwise,
		// and clockwise is always chosen in a tie. However, we do not want it to
		// always be clockwise, because we want a "bounce" effect.
		[[self chevron]
		 	setTransform:CGAffineTransformRotate(
				[[self chevron] transform],
				shouldShow ? -M_PI+0.01 : M_PI-0.01)];
	}];
}

- (IBAction)handleTodayTriggered {
	NSNumber *epochSeconds = makeTodaySeconds();
	[self scrollTo:epochSeconds];
	[self setSelectedKey:epochSeconds];
}

- (void)handleCellTap:(UITapGestureRecognizer*)sender {
	// the sender view is the contentView, which the cell view contains
	UICollectionViewCell *newCell = (UICollectionViewCell *)[[sender view] superview];
	NSIndexPath *newIP = [self.collView indexPathForCell:newCell];
	[self setSelectedKey:[[self dataSource] itemIdentifierForIndexPath:newIP]];
}

// respond to scrolling the collection view ("cal wheel")
- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
	NSUInteger epochAtIndex;
	{
		static int prevIndex = 0;
		CGFloat scrollPositionPercentage =
			[scrollView contentOffset].x / [scrollView contentSize].width;
		NSUInteger lastIndex = [[self celebrations] count];
		int indexAtViewLeadingEdge = (int)(scrollPositionPercentage * lastIndex);

		CGFloat scrollViewWidth = [[self collView] visibleSize].width;
		UICollectionViewFlowLayout *layout =
			(UICollectionViewFlowLayout*)[[self collView] collectionViewLayout];
		CGFloat itemWidth = [layout itemSize].width;
		int numItemsVisibleToCenter = scrollViewWidth / itemWidth / 2;
		// add N to make the month transition happen before
		// the "day 1" cell reaches the edge of the screen
		indexAtViewLeadingEdge += numItemsVisibleToCenter;

		if (indexAtViewLeadingEdge == prevIndex || indexAtViewLeadingEdge < 0) {
			// we haven't scrolled enough to warrant an update, bail
			// also bail if user scrolled too far off the view and the index is negative
			return;
		}
		prevIndex = indexAtViewLeadingEdge;
		epochAtIndex = [self minEpochSeconds] + prevIndex * kSecondsPerDay;
	}
	NSDate *d = [[NSDate alloc] initWithTimeIntervalSince1970:epochAtIndex];
	NSDateFormatter *df = [self dateFormatter];
	[df setDateFormat:@"MMMM y"];
	[[self monthLabel] setText:[df stringFromDate:d]];
}

- (void)viewDidLoad {
	[super viewDidLoad];


	[self setDateFormatter:makeDateFormatter()];
	[self setShouldShowDrawer:YES];
	[[[[self popupStack] superview] layer] setCornerRadius:6.0];
	[[[self todayBtn] layer] setCornerRadius:5.0];


	// Get all celebrations and insert them into the lookup table
	NSMutableArray *celTimes = [[NSMutableArray alloc] init];
	NSMutableArray *celValues = [[NSMutableArray alloc] init];
	{
		NSString *pathToDB = [[NSBundle mainBundle] pathForResource:@"litcal" ofType:@"sqlite"];
		struct lit_error *err;
		if (!open_db([pathToDB cStringUsingEncoding:NSASCIIStringEncoding], &_db, &err)) {
			NSLog(@"Failed to open the litcal database: %s", err->message);
			// TODO: is returning the best thing to do here?
			return;
		}

		int64_t min, max;
		uint64_t calID = 1;
		if (!lit_get_min_and_max(_db, calID, &min, &max, &err)) {
			NSLog(@"Failed to get min/max: %s", err->message);
			// TODO: is returning the best thing to do here?
			return;
		}
		[self setMinEpochSeconds:min];
		[self setMaxEpochSeconds:max];

		for (int64_t curr = min; curr <= max; curr += kSecondsPerDay) {
			struct lit_celebration cel;
			if (!lit_get_celebration(_db, calID, curr, &cel, &err)) {
				NSLog(@"Failed to get celebration at time %lld: %s", curr, err->message);
				// TODO: is return the best thing here?
				return;
			}
			[celTimes addObject:[[NSNumber alloc] initWithLongLong:curr]];
			[celValues addObject:[[LitCelebrationBridge alloc] initWithCLitCelebration:cel]];
		}
		[self setCelebrations:[[NSDictionary alloc] initWithObjects:celValues forKeys:celTimes]];
	}

	// wire each cell to its corresponding celebration
	[self setDataSource:[
		[UICollectionViewDiffableDataSource alloc]
		initWithCollectionView:[self collView]
		cellProvider:^UICollectionViewCell*(
			UICollectionView * collView,
			NSIndexPath * indexPath,
			NSNumber *epochSeconds
		) {
			UICollectionViewCell *cell = [
				collView dequeueReusableCellWithReuseIdentifier:@"dayCell"
				forIndexPath:indexPath
			];

			UITapGestureRecognizer *tapped = [
				[UITapGestureRecognizer alloc]
				initWithTarget:self action:@selector(handleCellTap:)
			];
			[[cell contentView] addGestureRecognizer:tapped];

			NSDate *d = [
				[NSDate alloc]
				initWithTimeIntervalSince1970:[epochSeconds doubleValue]
			];
			NSDateFormatter *df = [self dateFormatter];

			[df setDateFormat:@"EEEEE"];
			[[cell viewWithTag:1] setText:[df stringFromDate:d]];

			UILabel *dateLbl = [cell viewWithTag:2];
			[df setDateFormat:@"d"];
			[dateLbl setText:[df stringFromDate:d]];
			[[dateLbl layer] setCornerRadius:[dateLbl frame].size.width / 2];
			[dateLbl setClipsToBounds:YES];

			UIView *dot = [cell viewWithTag:3];
			LitCelebrationBridge *litCel = [[self celebrations] objectForKey:epochSeconds];
			[[dot layer] setCornerRadius:[dot frame].size.width / 2];
			[dot setClipsToBounds:YES];
			[[dot layer] setBorderWidth:0.0];
			[dot setBackgroundColor:nil];
			if ([litCel rank] <= 11) {
				[dot setBackgroundColor:uiColorFromLitColor([litCel color])];
				if ([litCel color] == LIT_WHITE) {
					[[dot layer] setBorderColor:[[UIColor colorNamed:kColAshes] CGColor]];
					[[dot layer] setBorderWidth:1.0];
				}
			}
			
			if ([epochSeconds isEqual:[self selectedKey]]) {
				[self highlightCell:cell];
			} else {
				[self unHighlightCell:cell];
			}

			return cell;
		}
	]];

	NSDiffableDataSourceSnapshot *snap = [[NSDiffableDataSourceSnapshot alloc] init];
	[snap appendSectionsWithIdentifiers:@[@(0)]];
	[snap appendItemsWithIdentifiers:celTimes];
	[[self dataSource] applySnapshotUsingReloadData:snap];
}

- (void)viewWillAppear:(BOOL)animated {
	CALayer *pl = [[[self popupStack] superview] layer];
	[pl setShadowColor:[[UIColor colorWithRed:0.004 green:0.0 blue:0.133 alpha:1.0] CGColor]];
	[pl setShadowOpacity:0.05];
	[pl setShadowRadius:14];
	[pl setShadowOffset:CGSizeMake(0, 4)];
}

- (void)viewDidLayoutSubviews {
	[super viewDidLayoutSubviews];
	// calling setTitle on the UIButton resets the font size,
	// so we fix it after layout
	[[[self link] titleLabel] setFont:[UIFont fontWithName:kFontName size:12.0]];
}

- (void)viewDidAppear:(BOOL)animated {
	// set initial scroll position
	[self handleTodayTriggered];
}


@end
