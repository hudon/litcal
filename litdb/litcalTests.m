//
//  litcalTests.m
//  coreTests
//
//  Created by James Hudon on 9/13/22.
//

// TODO: use these tests as inspiration for my tests, then discard file
//
//#import <XCTest/XCTest.h>
//#include "litcal_private.h"
//
//#pragma GCC diagnostic ignored "-Wgnu-statement-expression"
//
//#define TRY(exp) exp; do { l_raise_if_exists(err); } while(0)
//
//@interface litcalTests : XCTestCase
//
//@end
//
//@implementation litcalTests {
//    NSString *filenameNewFormat2023;
//    NSString *filenameNewFormat2022;
//    LCalendar *litcal;
//}
//
//NSString * nsify(const char* c)
//{
//    return [[NSString alloc] initWithUTF8String:c];
//}
//
//void l_raise_if_exists(LError *err)
//{
//    if (err != NULL) [NSException raise:@"LError" format:@"%@", nsify(err->message)];
//}
//
//- (void)setUp {
//    NSBundle *bundle = [NSBundle bundleForClass:[self class]];
//    filenameNewFormat2023 = [[NSString alloc] initWithString:[bundle pathForResource:@"LCAPI-USA-2023-with-2022events20221014-min" ofType:@"json"]];
//    filenameNewFormat2022 = [[NSString alloc] initWithString:[bundle pathForResource:@"LCAPI-USA-2022-20221014-min" ofType:@"json"]];
//    LError *err = NULL;
//    litcal = LCalendar_new([filenameNewFormat2022 UTF8String], &err);
//    l_raise_if_exists(err);
//}
//
//- (void)tearDown {
//    // Put teardown code here. This method is called after the invocation of each test method in the class.
//}
//
//- (void)testDuplicateData {
//    LError *err = NULL;
//    LCalendar_add_data(litcal, [filenameNewFormat2022 UTF8String], &err);
//    XCTAssertNotEqual(NULL, err, @"expected error");
//    XCTAssertEqualObjects(@"ERROR: Day for celebration MotherGod existed already in lookup table. celClock: 2022-01-01", nsify(err->message), @"expected error msg");
//}
//
//- (void)testBoundariesYear {
//    LError *err = NULL;
//
//    LYear minYear = l_min_year(litcal);
//    XCTAssertEqual(minYear.secularYear, l_max_year(litcal).secularYear,);
//
//    struct tm dateTm;
//    set_date_info(&dateTm, 2021, 11, 28);
//    XCTAssertEqual(timegm(&dateTm), minYear.startDate, );
//    set_date_info(&dateTm, 2022, 11, 26);
//    XCTAssertEqual(timegm(&dateTm), minYear.endDate, );
//
//    TRY(LCalendar_add_data(litcal, [filenameNewFormat2023 UTF8String], &err));
//    minYear = l_min_year(litcal);
//    LYear maxYear = l_max_year(litcal);
//
//    set_date_info(&dateTm, 2021, 11, 28);
//    XCTAssertEqual(timegm(&dateTm), minYear.startDate, );
//    set_date_info(&dateTm, 2022, 11, 26);
//    XCTAssertEqual(timegm(&dateTm), minYear.endDate, );
//    // Because the 2023 file contains some liturgical 2024 data (advent and Christmas at the end of secular 2023), 2024 is the "max year"
//    set_date_info(&dateTm, 2023, 12, 3);
//    XCTAssertEqual(timegm(&dateTm), maxYear.startDate, );
//    set_date_info(&dateTm, 2024, 11, 30);
//    XCTAssertEqual(timegm(&dateTm), maxYear.endDate, );
//}
//
//- (void)testDeleteCal {
//    LError *err = NULL;
//    LCalendar *cal = LCalendar_new([filenameNewFormat2022 UTF8String], &err);
//    l_raise_if_exists(err);
//    LCalendar_delete(cal);
//}
//
//- (void)testMissingYear {
//    LError *err = NULL;
//    LCalendar *cal = LCalendar_new([filenameNewFormat2023 UTF8String], &err);
//    l_raise_if_exists(err);
//    l_get_lit_day(cal, 2022, 6, 1, &err);
//    XCTAssertNotEqual(NULL, err, @"expected error");
//    XCTAssertEqualObjects(@"Could not find liturgical date for: 2022-06-01", nsify(err->message), @"expected error msg");
//}
//
//
////
//- (void)testAdventOfLitYear2023 {
//    LError *err = NULL;
//    LCalendar *cal = LCalendar_new([filenameNewFormat2023 UTF8String], &err); l_raise_if_exists(err);
//    LDay day = TRY(l_get_lit_day(cal, 2022, 11, 28, &err));
//    XCTAssertEqual(1669593600, day.secularDate,);
//    LCelebration cel = TRY(l_non_optional_mass(day, &err));
//
//    XCTAssertEqualObjects(nsify(cel.name), @"Monday of the 1st Week of Advent",);
//    XCTAssertEqual(cel.color, L_VIOLET,);
//    XCTAssertEqualObjects(nsify(day.lSeason.name), @"Advent",);
//}
//
//- (void)testAdventOfLitYear2023MissingYear {
//    LError *err;
//    (void)l_get_lit_day(litcal, 2022, 11, 28, &err);
//
//    XCTAssertNotEqual(NULL, err, @"expected error");
//    XCTAssertEqualObjects(@"Could not find liturgical date for: 2022-11-28", nsify(err->message),);
//}
//
//- (void)testDayBeforeAdvent2023 {
//    LError *err = NULL;
//    LCalendar_add_data(litcal, [filenameNewFormat2023 UTF8String], &err);
//    LDay day = TRY(l_get_lit_day(litcal, 2022, 11, 26, &err));
//    XCTAssertEqual(1669420800, day.secularDate,);
//    LCelebration cel = TRY(l_non_optional_mass(day, &err));
//
//    XCTAssertEqualObjects(nsify(cel.name), @"Saturday of the 34th Week of Ordinary Time",);
//    XCTAssertEqual(cel.color, L_GREEN,);
//    XCTAssertEqualObjects(nsify(day.lSeason.name), @"Ordinary Time",);
//}
//
//- (void)testDayBeforeAdvent2023MissingYear {
//    LError *err = NULL;
//    LCalendar *cal = LCalendar_new([filenameNewFormat2023 UTF8String], &err); l_raise_if_exists(err);
//    (void)l_get_lit_day(cal, 2022, 11, 26, &err);
//
//    XCTAssertNotEqual(NULL, err, @"expected error");
//    XCTAssertEqualObjects(@"Could not find liturgical date for: 2022-11-26", nsify(err->message),);
//
//}
//
//- (void)testLitTitles
//{
//    LError *err = NULL;
//    LDay day = TRY(l_get_lit_day(litcal, 2022, 1, 4, &err));
//    LCelebration cel = TRY(l_non_optional_mass(day, &err));
//
//    XCTAssertEqualObjects(@(cel.title), @"Saint Elizabeth Ann Seton",);
//    XCTAssertEqualObjects(@(cel.subtitle), @"Religious",);
//}
//
//- (void)testMissingLitSubtitle
//{
//    LError *err = NULL;
//    TRY(LCalendar_add_data(litcal, [filenameNewFormat2023 UTF8String], &err));
//    LDay day = TRY(l_get_lit_day(litcal, 2023, 1, 1, &err));
//    LCelebration cel = TRY(l_non_optional_mass(day, &err));
//
//    XCTAssertEqualObjects(@(cel.title), @"Mary, Mother of God",);
//    XCTAssertEqualObjects(@(cel.subtitle), @"",);
//}
//
//- (void)testCalendarImplHasAllDaysWhenAddingMultipleFiles
//{
//    LError *err = NULL;
//    TRY(LCalendar_add_data(litcal, [filenameNewFormat2023 UTF8String], &err));
//
//    int dayCount = 0;
//
//    LDay *curr = litcal->_impl->daysRoot;
//    while(curr != NULL){
//        ++dayCount;
//        curr = curr->_impl->next;
//    }
//
//    XCTAssertEqual(dayCount, 723,);
//}
//
//- (void)testGetMassCelebrations
//{
//    LError *err = NULL;
//    LDay day = TRY(l_get_lit_day(litcal, 2022, 6, 5, &err));
//    LCelebration cel = TRY(l_non_optional_mass(day, &err));
//
//    XCTAssertEqualObjects(@(cel.name), @"Pentecost",);
//    XCTAssertEqual(cel.color, L_RED,);
//    XCTAssertEqualObjects(@(day.lSeason.name), @"Easter",);
//    XCTAssertEqual(day.lSeason.color, L_WHITE,);
//}
//
//- (void)testGetNonOptionalMass
//{
//    LError *err = NULL;
//    LDay day = TRY(l_get_lit_day(litcal, 2022, 1, 6, &err));
//    LCelebration cel = TRY(l_non_optional_mass(day, &err));
//
//    XCTAssertEqualObjects(@(cel.name), @"4th Day After Epiphany",);
//    XCTAssertEqual(cel.color, L_WHITE,);
//    XCTAssertEqualObjects(@(day.lSeason.name), @"Christmas",);
//}
//
//- (void)testLoadNewDataFormat
//{
//    LError *err = NULL;
//    TRY(LCalendar_add_data(litcal, [filenameNewFormat2023 UTF8String], &err));
//    LDay day = TRY(l_get_lit_day(litcal, 2023, 1, 1, &err));
//    LCelebration cel = TRY(l_non_optional_mass(day, &err));
//
//    XCTAssertEqualObjects(@(cel.title), @"Mary, Mother of God",);
//    XCTAssertEqualObjects(@(cel.subtitle), @"",);
//}
//
//- (void)testPerformanceExample {
//    // This is an example of a performance test case.
//    [self measureBlock:^{
//        // Put the code you want to measure the time of here.
//    }];
//}
//
//@end
