//
//  ViewController.m
//  litcal-ios
//
//  Created by James Hudon on 2/1/24.
//

#import "ViewController.h"
#import "litdb.h"
#import "litdbBridge/LitCelebrationBridge.h"

@interface ViewController () {
    sqlite3 *db;
}

@property (strong, nonatomic) UICollectionViewDiffableDataSource *dataSource;
@property (strong) NSDictionary *celebrations;
@property (strong, nonatomic) NSNumber *selectedKey;

@end


@implementation ViewController

- (void)handleGesture:(UITapGestureRecognizer*)sender {
    // reocognizer is on cell's inner contentView
    UICollectionViewCell *cell = (UICollectionViewCell *)[[sender view] superview];
    NSIndexPath *indexPath = [self.collView indexPathForCell:cell];
    [self setSelectedKey:[[self dataSource] itemIdentifierForIndexPath:indexPath]];
    NSLog(@"selecting key! %@ %@", [self selectedKey], indexPath);
}

- (void)viewDidLoad {
    [super viewDidLoad];

    // Get all celebrations and insert them into the lookup table
    NSMutableArray *celTimes = [[NSMutableArray alloc] init];
    NSMutableArray *celValues = [[NSMutableArray alloc] init];
    {
        NSString *pathToDB = [[NSBundle mainBundle] pathForResource:@"litcal" ofType:@"sqlite"];
        struct lit_error *err;
        if (!open_db([pathToDB cStringUsingEncoding:NSASCIIStringEncoding], &db, &err)) {
            NSLog(@"Failed to open the litcal database: %s", err->message);
            // TODO: is returning the best thing to do here?
            return;
        }

        int64_t min, max;
        uint64_t calID = 1;
        if (!lit_get_min_and_max(db, calID, &min, &max, &err)) {
            NSLog(@"Failed to get min/max: %s", err->message);
            // TODO: is returning the best thing to do here?
            return;
        }

        for (int64_t curr = min; curr <= max; curr += 86400) {
            struct lit_celebration cel;
            if (!lit_get_celebration(db, calID, curr, &cel, &err)) {
                NSLog(@"Failed to get celebration at time %lld: %s", curr, err->message);
                // TODO is return the best thing here?
                return;
            }
            [celTimes addObject:[[NSNumber alloc] initWithLongLong:curr]];
            [celValues addObject:[[LitCelebrationBridge alloc] initWithCLitCelebration:cel]];
        }
        [self setCelebrations:[[NSDictionary alloc] initWithObjects:celValues forKeys:celTimes]];
    }


    // wire each cell to its corresponding celebration
    [self setDataSource:[[UICollectionViewDiffableDataSource alloc]
                         initWithCollectionView:[self collView]
                         cellProvider:^UICollectionViewCell*(UICollectionView * collView,
                                                             NSIndexPath * indexPath,
                                                             id epochSeconds) {
        UICollectionViewCell *cell = [collView
                                      dequeueReusableCellWithReuseIdentifier:@"dayCell"
                                      forIndexPath: indexPath];

        UITapGestureRecognizer *tapped = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleGesture:)];
        [[cell contentView] addGestureRecognizer:tapped];

        NSDate *d = [[NSDate alloc] initWithTimeIntervalSince1970:[epochSeconds doubleValue]];
        NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
        [dateFormatter setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"en_US_POSIX"]];
        [dateFormatter setTimeZone:[NSTimeZone timeZoneForSecondsFromGMT:0]];
        //        NSString *s = [[[self celebrations] objectForKey:epochSeconds] title];

        [dateFormatter setDateFormat:@"d"];
        [[cell viewWithTag:1] setText:[dateFormatter stringFromDate:d]];
        [dateFormatter setDateFormat:@"EEEEE"];
        [[cell viewWithTag:2] setText:[dateFormatter stringFromDate:d]];

        return cell;
    }]];

    NSDiffableDataSourceSnapshot *snap = [[NSDiffableDataSourceSnapshot alloc] init];
    [snap appendSectionsWithIdentifiers:@[@(0)]];
    [snap appendItemsWithIdentifiers:celTimes];
    [[self dataSource] applySnapshotUsingReloadData:snap];
}
@end
