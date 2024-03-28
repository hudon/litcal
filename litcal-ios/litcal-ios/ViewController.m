//
//  ViewController.m
//  litcal-ios
//
//  Created by James Hudon on 2/1/24.
//

#import "ViewController.h"
#import "litdb.h"
#import "litdbBridge/LitCelebrationBridge.h"

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

@end


@implementation ViewController

- (IBAction)handleChevronTap:(id)sender {
	BOOL shouldShow = ![self shouldShowDrawer];
	[self setShouldShowDrawer:shouldShow];

	// We want drawer to hide underneath above view as it slides out of view
	[[[self drawer] superview] sendSubviewToBack:[self drawer]];

	CGFloat drawerHeight = [[self drawer] frame].size.height;
	[[self scrollViewTopConstraint] setConstant:shouldShow ? 0.0 : -drawerHeight];

	[UIView animateWithDuration:0.25 animations:^{
		[[[self drawer] superview] layoutIfNeeded];
		[[self drawer] setAlpha:shouldShow ? 1.0 : 0.0];
	}];
}

- (IBAction)handleTodayTriggered {
	NSCalendar *cal = [NSCalendar currentCalendar];
	cal.timeZone = [NSTimeZone timeZoneForSecondsFromGMT:0];
	int epochSeconds =
		[[cal startOfDayForDate:[NSDate date]] timeIntervalSince1970];

	// find today in the existing range of dates, as a percentage
	CGFloat todayPosition = 
		(CGFloat)(epochSeconds - _minEpochSeconds) /
		(_maxEpochSeconds - _minEpochSeconds);

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

	[self setSelectedKey:[NSNumber numberWithInt:epochSeconds]];
}

- (LitCelebrationBridge*)selectedCelebration {
	return [[self celebrations] objectForKey:[self selectedKey]];
}

- (void)setSelectedKey:(NSNumber *)selectedKey {
	_selectedKey = selectedKey;
	[[self gospelText] setText:[[self selectedCelebration] gospelText]];
}

- (void)handleCellTap:(UITapGestureRecognizer*)sender {
	// the sender view is the contentView, and the cell view contains it
	UICollectionViewCell *cell = (UICollectionViewCell *)[[sender view] superview];
	NSIndexPath *indexPath = [self.collView indexPathForCell:cell];
	[self setSelectedKey:[[self dataSource] itemIdentifierForIndexPath:indexPath]];
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
		// add N to make the month transition happen before 
		// the "day 1" cell reaches the edge of the screen
		indexAtViewLeadingEdge += 3;
		if (indexAtViewLeadingEdge == prevIndex || indexAtViewLeadingEdge < 0) {
			// we haven't scrolled enough to warrant an update, bail
			// also bail if user scrolled too far off the view and the index is negative
			return;
		}
		prevIndex = indexAtViewLeadingEdge;
		epochAtIndex = _minEpochSeconds + prevIndex * kSecondsPerDay;
	}
	NSDate *d = [[NSDate alloc] initWithTimeIntervalSince1970:epochAtIndex];
	[_dateFormatter setDateFormat:@"MMMM y"];
	[[self monthLabel] setText:[_dateFormatter stringFromDate:d]];
}

- (void)viewDidLoad {
	[super viewDidLoad];


	[self setDateFormatter:[[NSDateFormatter alloc] init]];
	[[self dateFormatter]
		setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"en_US_POSIX"]];
	[[self dateFormatter] setTimeZone:[NSTimeZone timeZoneForSecondsFromGMT:0]];


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
		_minEpochSeconds = min;
		_maxEpochSeconds = max;

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
			id epochSeconds
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
			[df setDateFormat:@"d"];
			[[cell viewWithTag:1] setText:[df stringFromDate:d]];
			[df setDateFormat:@"EEEEE"];
			[[cell viewWithTag:2] setText:[df stringFromDate:d]];

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
