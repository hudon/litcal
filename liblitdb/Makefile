CC=gcc
CFLAGS=-I.
LDFLAGS=-lsqlite3

SOURCES = $(wildcard *.c)
OBJECTS = $(SOURCES:.c=.o)

.PHONY: all clean check

check: liblitdb_test
	./liblitdb_test

liblitdb_test: liblitdb.o errors.o liblitdb_test.o errors_test.o
	$(CC) -o liblitdb_test $^ $(LDFLAGS)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f main $(OBJECTS)

