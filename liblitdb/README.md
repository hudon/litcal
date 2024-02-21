# Styleguide

* case
  * PascalCase structs, enums. Acronyms like URLSegment are capitalized.
    * files should be flatcase, or flatcase_snake to separate the filename from an attribute (eg. litcal.c vs litcal_test.c)
    * files can be PascalCase if they are about one type only, like ViewController.m for a file that just contains the implementation of a ViewController type
  * camelCase or flatcase variables. Acronyms like targetURL are capitalized.
  * snake_case functions
  * CAPS_SNAKE_CASE enum values and global constants
* Braces
    * open the brace on the same line as the corresponding statement. This matches Go's style.
    * close the brace on its own line
* Error reporting
    * we use a style similar to GLib's GError https://docs.gtk.org/glib/error-reporting.html
    * It is also similar Apple's NSError: https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/ErrorHandling/ErrorHandling.html


