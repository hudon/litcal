--UP
create table lit_calendar (id integer primary key, name text);
create table lit_color (id integer primary key, name text);
create table lit_season (
    id integer primary key,
    name text, 
    start_date_s integer,
    end_date_s integer,
    lit_color_id integer, 
    lit_year_id integer,
    foreign key (lit_color_id) references lit_color(id),
    foreign key (lit_year_id) references lit_year(id)
);
create table lit_day (
    id integer primary key,
    secular_date_s integer,
    lit_season_id integer, 
    foreign key (lit_season_id) references lit_season(id),
    unique (secular_date_s)
);
create table lit_year (
    id integer primary key,
    start_date_s integer, end_date_s integer,
    secular integer,
    lit_calendar_id integer,
    foreign key (lit_calendar_id) references lit_calendar(id)
);
-- for now lit_day_id is unique because we only support 1 celebration per day
create table lit_celebration (
    id integer primary key,
    lit_day_id integer,
    lit_color_id integer,
    rank integer,
    title text,
    subtitle text,
    gospel text,
    gospel_ref text,
    readings_url text,
    foreign key (lit_day_id) references lit_day(id),
    foreign key (lit_color_id) references lit_color(id),
    unique (lit_day_id)
);

--DOWN
drop table lit_celebration;
drop table lit_year;
drop table lit_day;
drop table lit_season;
drop table lit_color;
drop table lit_calendar;
