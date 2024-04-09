cmake_minimum_required(VERSION 3.28)
project(litdb C)

set(CMAKE_C_STANDARD 23)

add_library(litdb STATIC
        litdb.c
        dates.c
        errors.c)
