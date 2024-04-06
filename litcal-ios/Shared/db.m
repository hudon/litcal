//
//  db.m
//  litcal-ios
//
//  Created by James Hudon on 4/6/24.
//

#import "db.h"

NSInteger kCalID = 1;

BOOL openDBAtBundleRoot(sqlite3 **out_db, struct lit_error **out_err) {
	NSString *pathToDB = [[NSBundle mainBundle] pathForResource:@"litcal" ofType:@"sqlite"];
	return open_db([pathToDB cStringUsingEncoding:NSASCIIStringEncoding], out_db, out_err);
}

