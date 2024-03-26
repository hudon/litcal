CC=gcc
CFLAGS=-I.
LDFLAGS=-lsqlite3

ALL_SOURCES = $(wildcard *.c)
SOURCES = $(filter-out %_test.c, $(ALL_SOURCES))
TEST_SOURCES = $(filter %_test.c, $(ALL_SOURCES))
OBJECTS = $(SOURCES:.c=.o)
TEST_OBJECTS = $(TEST_SOURCES:.c=.o)

.PHONY: all clean check

all: liblitdb.a check

check: litdb_test
	./litdb_test

liblitdb.a: $(OBJECTS)
	ar rcs $@ $^

litdb_test: $(OBJECTS) $(TEST_OBJECTS)
	$(CC) -o litdb_test $^ $(LDFLAGS)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f main $(OBJECTS) $(TEST_OBJECTS)

