#include <stdio.h>

int main(void) {
// lit_year(id int, secular int unique, start_date time, end_date time)
// lit_season(id int, name string, lit_color enum, start_date, end_date, lit_year_id index)
// lit_day(id int, secular_date date unique, lit_season_id index)
// lit_celebration(id int, lit_day_id index, name string, etc.)
//
// select * from lit_day where secular_date = '2021-09-11';
// select * from lit_celebration where mass_date = '2021-09-11';
//
// Note that this structure is for instantiated celebrations.
// A future app may have a store of un-instantiated celebrations, where for example the "3rd Wednesday of OT" is not tied
// to any particular date, until a year is given.
}
