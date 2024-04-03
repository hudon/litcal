//
//  ViewController.m
//  litcal-ios
//
//  Created by James Hudon on 2/1/24.
//

#import "ViewController.h"
#import "litdb.h"
#import "litdbBridge/LitCelebrationBridge.h"
#import "dates.h"
#import "colors.h"

static const NSTimeInterval kSecondsPerDay = 86400;

@interface ViewController () <UIScrollViewDelegate>

@property (weak, nonatomic) IBOutlet UICollectionView *collView;
@property (weak, nonatomic) IBOutlet UILabel *gospelText;
@property (weak, nonatomic) IBOutlet UILabel *monthLabel;
@property (weak, nonatomic) IBOutlet UIImageView *chevron;
@property (weak, nonatomic) IBOutlet UIStackView *drawer;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *scrollViewTopConstraint;

@property (strong, nonatomic) UICollectionViewDiffableDataSource *dataSource;
@property (strong, nonatomic) NSDictionary *celebrations;
@property (strong, nonatomic) NSNumber *selectedKey;
@property (strong, nonatomic) NSDateFormatter *dateFormatter;
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

	NSIndexPath *oldIP = [[self dataSource] indexPathForItemIdentifier:_selectedKey];
	UICollectionViewCell *oldCell = [[self collView] cellForItemAtIndexPath:oldIP];
	[self unHighlightCell:oldCell];

	_selectedKey = selectedKey;

	NSIndexPath *newIP = [[self dataSource] indexPathForItemIdentifier:_selectedKey];
	[self highlightCell:(UICollectionViewCell *)[[self collView] cellForItemAtIndexPath:newIP]];

	// celebration details
	[[self gospelText] setText:[[self selectedCelebration] gospelText]];
}

- (void)scrollTo:(NSNumber*)key {
	// find today in the existing range of dates, as a percentage
	NSUInteger min = [self minEpochSeconds], max = [self maxEpochSeconds];
	CGFloat todayPosition =
		(CGFloat)([key longLongValue] - min) / (max - min);

	UICollectionViewFlowLayout *layout =
		(UICollectionViewFlowLayout*)[[self collView] collectionViewLayout];
	CGFloat scrollViewWidth = [[self collView] visibleSize].width;
	// The first operand is the distance from cell_first.x to cell_last.x. So if todayPosition=100%,
	// then x will be the X origin of the last cell
	CGFloat x = ([[self collView] contentSize].width - [layout itemSize].width) * todayPosition;
	// center today cell by moving x away from the center of
	// the scrollView width and away from the center of the cell
	x = x - scrollViewWidth / 2 + [layout itemSize].width / 2;

	// we give the rect a minimal arbitrary height to avoid UIKit ignoring our request
	CGRect r = CGRectMake(x, 0, scrollViewWidth, 1);
	[[self collView] scrollRectToVisible:r animated:YES];
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
	NSNumber *today = makeTodaySeconds();
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
			
			if ([epochSeconds isEqual:today]) {
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

- (void)viewDidAppear:(BOOL)animated {
	// set initial scroll position
	[self handleTodayTriggered];
}
@end
