#include "liblitdb.h"

#include <assert.h>
#include <stddef.h>
#include <stdio.h>

int main() {
  int result = lit_get_celebration(NULL, 0);

  assert(result == 0);

  return 0;
}
