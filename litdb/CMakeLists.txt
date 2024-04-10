cmake_minimum_required(VERSION 3.28)
project(litdb C CXX)

set(CMAKE_C_STANDARD 23)

include_directories(src)
add_subdirectory(src)

add_subdirectory(test)
