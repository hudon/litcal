//
//  ViewController.m
//  litcal-ios
//
//  Created by James Hudon on 2/1/24.
//

#import "ViewController.h"

@interface ViewController ()

@property (strong, nonatomic) UICollectionViewDiffableDataSource *dataSource;

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    // Setup the CalWheel dates
    // TODO: do I make a snapshot of dates and then pull from SQLite in the cellProvider block? or do I make a snapshot of the LitCelebration objects (and pre-fetch everything)?
    [self setDataSource: [[UICollectionViewDiffableDataSource alloc]
                          initWithCollectionView:[self collView]
                          cellProvider:^UICollectionViewCell * (UICollectionView * collView,
                                                                NSIndexPath * indexPath,
                                                                NSString *itemIdentifier) {
        UICollectionViewCell *cell = [collView dequeueReusableCellWithReuseIdentifier:@"dayCell" forIndexPath: indexPath];
        UILabel *lbl = (UILabel *)[cell viewWithTag:1];
        lbl.text = itemIdentifier;
        return cell;
    }]];
    NSDiffableDataSourceSnapshot *snap = [[NSDiffableDataSourceSnapshot alloc] init];
    [snap appendSectionsWithIdentifiers:@[@(0)]];
    // NOTE: the identifiers need to be unique
    // TODO: look into how these identifiers should be used
    [snap appendItemsWithIdentifiers:@[@"98", @"34", @"11",@"91", @"4", @"1",@"8", @"31", @"21",@"92", @"22", @"81",@"88", @"74", @"17"]];
    [[self dataSource] applySnapshotUsingReloadData:snap];
}

@end

