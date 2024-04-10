
add_library(litdb STATIC
        litdb.c
        dates.c
        errors.c)
target_link_libraries(litdb sqlite3)