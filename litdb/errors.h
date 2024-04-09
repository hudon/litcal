//
// Created by James Hudon on 4/7/24.
//

#ifndef LITDB_ERRORS_H
#define LITDB_ERRORS_H

enum lit_status {
    LIT_OK = 0,
    LIT_ERROR = 1,
    LIT_INVALID_ARGUMENT = 2,
    LIT_NOT_FOUND = 3,
    LIT_NO_MEM = 4
};

struct lit_error {
    enum lit_status status;
    char message[256];
};

void lit_error_free(struct lit_error *err);

#endif //LITDB_ERRORS_H
