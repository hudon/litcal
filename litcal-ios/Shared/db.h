//
//  db.h
//  litcal-ios
//
//  Created by James Hudon on 4/6/24.
//

#import "litdb.h"
#import <Foundation/Foundation.h>

extern NSInteger kCalID;
BOOL openDBAtBundleRoot(sqlite3 **out_db, struct lit_error **out_err);
