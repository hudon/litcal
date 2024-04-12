add_library(litdb SHARED
        litdb.c
        dates.c
        errors.c)
target_link_libraries(litdb sqlite3)