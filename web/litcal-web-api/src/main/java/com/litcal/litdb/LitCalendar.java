package com.litcal.litdb;
import com.litcal.litdb.guts.lit_celebration;
import com.litcal.litdb.guts.litdb_h;

import java.lang.foreign.Arena;
import java.lang.foreign.MemorySegment;

public class LitCalendar {

    static public String foo() {
        try (Arena arena = Arena.ofConfined()) {
            MemorySegment cel = lit_celebration.allocate(arena);
            lit_celebration.color(cel, litdb_h.LIT_GOLD());
//            lit_celebration.gos
//            Point2d.x(point, 3d);
//            Point2d.y(point, 4d);
//            litdb_h.lit_get_min_and_max()
            return STR."color is \{lit_celebration.color(cel)}";
        }
    }
}
