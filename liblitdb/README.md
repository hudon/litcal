# Styleguide

* case
    * snake_case functions and types. flatcase variables
    * files should be flatcase, or flatcase_snake to separate the filename from an attribute (eg. litcal.c vs litcal_test.c)
    * CAPS_SNAKE_CASE enum values and global constants
* Braces
    * open the brace on the same line as the corresponding statement. This matches Go's style.
    * close the brace on its own line
* Error reporting
    * we use a style similar to GLib's GError https://docs.gtk.org/glib/error-reporting.html
    * It is also similar Apple's NSError: https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/ErrorHandling/ErrorHandling.html


