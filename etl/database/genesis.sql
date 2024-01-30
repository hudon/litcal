-- Not a migration file, but necessary pre-condition for litcal and litcal_test databases to exist

create table version (version integer primary key);insert into version values (0);