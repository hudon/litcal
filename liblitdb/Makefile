CC=gcc
CFLAGS=-I.

all: main

check: liblitdb.o liblitdb_test.o
	$(CC) -o main $^

liblitdb.o: liblitdb.c
	$(CC) $(CFLAGS) -c $^

liblitdb_test.o: liblitdb_test.c
	$(CC) $(CFLAGS) -c $^

clean:
	rm -f main main.o

.PHONY: all clean