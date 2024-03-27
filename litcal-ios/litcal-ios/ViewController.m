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

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    NSMutableArray *keyArray = [[NSMutableArray alloc] init];
    NSMutableArray *valueArray = [[NSMutableArray alloc] init];
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
            [keyArray addObject:[[NSNumber alloc] initWithLongLong:curr]];
            [valueArray addObject:[[LitCelebrationBridge alloc] initWithCLitCelebration:cel]];
        }
        [self setCelebrations:[[NSDictionary alloc] initWithObjects:valueArray forKeys:keyArray]];
    }


    // wire each cell to its corresponding celebration
    [self setDataSource: [[UICollectionViewDiffableDataSource alloc]
                          initWithCollectionView:[self collView]
                          cellProvider:^UICollectionViewCell*(UICollectionView * collView,
                                                              NSIndexPath * indexPath,
                                                              id epochSeconds) {
        UICollectionViewCell *cell = [collView
                                      dequeueReusableCellWithReuseIdentifier:@"dayCell"
                                      forIndexPath: indexPath];
        UILabel *lbl = (UILabel *)[cell viewWithTag:1];

        NSDate *d = [[NSDate alloc] initWithTimeIntervalSince1970:[epochSeconds doubleValue]];
        NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
        dateFormatter.locale = [[NSLocale alloc] initWithLocaleIdentifier:@"en_US_POSIX"];
        dateFormatter.timeZone = [NSTimeZone timeZoneForSecondsFromGMT:0];
        NSString *s = [[[self celebrations] objectForKey:epochSeconds] title];

        [dateFormatter setDateFormat:@"d"];
        lbl.text = [dateFormatter stringFromDate:d];

        [dateFormatter setDateFormat:@"EEEEE"];
        lbl.text = [dateFormatter stringFromDate:d];

        return cell;
    }]];

    NSDiffableDataSourceSnapshot *snap = [[NSDiffableDataSourceSnapshot alloc] init];
    [snap appendSectionsWithIdentifiers:@[@(0)]];
    // NOTE: the identifiers need to be unique
    // TODO: look into how these identifiers should be used
    [snap appendItemsWithIdentifiers:keyArray];
    [[self dataSource] applySnapshotUsingReloadData:snap];
}

@end

