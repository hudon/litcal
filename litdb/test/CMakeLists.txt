find_package(Catch2 3 REQUIRED)
# These tests can use the Catch2-provided main
add_executable(litdb_test dates_test.cpp
        errors_test.cpp
        litdb_test.cpp)
set_target_properties(litdb_test PROPERTIES LINKER_LANGUAGE CXX)
target_link_libraries(litdb_test PRIVATE litdb)
target_link_libraries(litdb_test PRIVATE Catch2::Catch2WithMain)

include(Catch)
catch_discover_tests(litdb_test)