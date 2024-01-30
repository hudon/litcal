--UP
-- ideally the column would be unique, but with sqlite3 we'd have to create a new table, move the data over, and drop the old table. Not worth it.
alter table lit_celebration add event_key string;
--DOWN
alter table lit_celebration drop column event_key;
