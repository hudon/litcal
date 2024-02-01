CC=gcc
CFLAGS=-I.

all: main

main: main.o
	$(CC) -o main main.o

main.o: main.c
	$(CC) $(CFLAGS) -c main.c

clean:
	rm -f main main.o

.PHONY: all clean