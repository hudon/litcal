# Litcal

This script [lib/main.js](./lib/main.js) to compute the liturgical celebrations of the day
is self-contained with 0 dependencies, so it may be simply loaded in a <script> tag.
It was written with the Archdiocese of San Francisco in mind but is
suitable for any diocese with the same rules (eg. Epiphany and Ascension on Sunday). 

All you need is a function call to `getCelebrations(cache, y, m, d)` where
`cache` is an object to which you want to hold a reference (so that you can call
`getCelebrations` again and it doesn't have to recompute the whole year). `y, m, d`
are the date components. Note that `m` (the month) is 0-indexed, like in JavaScript's
`Date` object, but `d` is 1-indexed. This pattern was maintained to be consistent
with the use of `Date`.
