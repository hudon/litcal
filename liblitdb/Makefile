CC=gcc
CFLAGS=-I.

check: liblitdb_test
	./liblitdb_test

liblitdb_test: liblitdb.o liblitdb_test.o
	$(CC) -o liblitdb_test liblitdb.o liblitdb_test.o

liblitdb_test.o: liblitdb_test.c
	$(CC) $(CFLAGS) -c $^

liblitdb.o: liblitdb.c
	$(CC) $(CFLAGS) -c $^

clean:
	rm -f main main.o

.PHONY: all clean check