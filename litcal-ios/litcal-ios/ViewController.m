//
//  ViewController.m
//  litcal-ios
//
//  Created by James Hudon on 2/1/24.
//

#import "ViewController.h"

@interface ViewController ()

@property (strong, nonatomic) UICollectionViewDiffableDataSource *dataSource;
@property NSDictionary *celebrations;

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    // wire each cell to its corresponding celebration
    [self setDataSource: [[UICollectionViewDiffableDataSource alloc]
                          initWithCollectionView:[self collView]
                          cellProvider:^UICollectionViewCell * (UICollectionView * collView,
                                                                NSIndexPath * indexPath,
                                                                NSString *itemIdentifier) {
        UICollectionViewCell *cell = [collView dequeueReusableCellWithReuseIdentifier:@"dayCell" forIndexPath: indexPath];
        // TODO: get from celebrations dict the celebration for the given identifier
        // change the identifier to the date (NSNumber? NSDate?)
        UILabel *lbl = (UILabel *)[cell viewWithTag:1];
        lbl.text = itemIdentifier;
        return cell;
    }]];

    // Fetch the dates and store them in a dictionary
    // TODO
    // get min and max
    // iterate over dates
    // get celebration for date, error if hole
    // insert into dict
    NSDiffableDataSourceSnapshot *snap = [[NSDiffableDataSourceSnapshot alloc] init];
    [snap appendSectionsWithIdentifiers:@[@(0)]];
    // NOTE: the identifiers need to be unique
    // TODO: look into how these identifiers should be used
    [snap appendItemsWithIdentifiers:@[@"98", @"34", @"11",@"91", @"4", @"1",@"8", @"31", @"21",@"92", @"22", @"81",@"88", @"74", @"17"]];
    [[self dataSource] applySnapshotUsingReloadData:snap];
}

@end

