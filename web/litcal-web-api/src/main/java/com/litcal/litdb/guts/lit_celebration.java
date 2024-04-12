// Generated by jextract

package com.litcal.litdb.guts;

import java.lang.invoke.*;
import java.lang.foreign.*;
import java.nio.ByteOrder;
import java.util.*;
import java.util.function.*;
import java.util.stream.*;

import static java.lang.foreign.ValueLayout.*;
import static java.lang.foreign.MemoryLayout.PathElement.*;

/**
 * {@snippet lang=c :
 * struct lit_celebration {
 *     char event_key[128];
 *     int rank;
 *     enum lit_color color;
 *     char title[256];
 *     char subtitle[128];
 *     char gospel_ref[64];
 *     char *gospel_text;
 *     char *readings_url;
 *     char season[32];
 *     int64_t epoch_seconds;
 * }
 * }
 */
public class lit_celebration {

    lit_celebration() {
        // Should not be called directly
    }

    private static final GroupLayout $LAYOUT = MemoryLayout.structLayout(
        MemoryLayout.sequenceLayout(128, litdb_h.C_CHAR).withName("event_key"),
        litdb_h.C_INT.withName("rank"),
        litdb_h.C_INT.withName("color"),
        MemoryLayout.sequenceLayout(256, litdb_h.C_CHAR).withName("title"),
        MemoryLayout.sequenceLayout(128, litdb_h.C_CHAR).withName("subtitle"),
        MemoryLayout.sequenceLayout(64, litdb_h.C_CHAR).withName("gospel_ref"),
        litdb_h.C_POINTER.withName("gospel_text"),
        litdb_h.C_POINTER.withName("readings_url"),
        MemoryLayout.sequenceLayout(32, litdb_h.C_CHAR).withName("season"),
        litdb_h.C_LONG_LONG.withName("epoch_seconds")
    ).withName("lit_celebration");

    /**
     * The layout of this struct
     */
    public static final GroupLayout layout() {
        return $LAYOUT;
    }

    private static final SequenceLayout event_key$LAYOUT = (SequenceLayout)$LAYOUT.select(groupElement("event_key"));

    /**
     * Layout for field:
     * {@snippet lang=c :
     * char event_key[128]
     * }
     */
    public static final SequenceLayout event_key$layout() {
        return event_key$LAYOUT;
    }

    private static final long event_key$OFFSET = 0;

    /**
     * Offset for field:
     * {@snippet lang=c :
     * char event_key[128]
     * }
     */
    public static final long event_key$offset() {
        return event_key$OFFSET;
    }

    /**
     * Getter for field:
     * {@snippet lang=c :
     * char event_key[128]
     * }
     */
    public static MemorySegment event_key(MemorySegment struct) {
        return struct.asSlice(event_key$OFFSET, event_key$LAYOUT.byteSize());
    }

    /**
     * Setter for field:
     * {@snippet lang=c :
     * char event_key[128]
     * }
     */
    public static void event_key(MemorySegment struct, MemorySegment fieldValue) {
        MemorySegment.copy(fieldValue, 0L, struct, event_key$OFFSET, event_key$LAYOUT.byteSize());
    }

    private static long[] event_key$DIMS = { 128 };

    /**
     * Dimensions for array field:
     * {@snippet lang=c :
     * char event_key[128]
     * }
     */
    public static long[] event_key$dimensions() {
        return event_key$DIMS;
    }
    private static final VarHandle event_key$ELEM_HANDLE = event_key$LAYOUT.varHandle(sequenceElement());

    /**
     * Indexed getter for field:
     * {@snippet lang=c :
     * char event_key[128]
     * }
     */
    public static byte event_key(MemorySegment struct, long index0) {
        return (byte)event_key$ELEM_HANDLE.get(struct, 0L, index0);
    }

    /**
     * Indexed setter for field:
     * {@snippet lang=c :
     * char event_key[128]
     * }
     */
    public static void event_key(MemorySegment struct, long index0, byte fieldValue) {
        event_key$ELEM_HANDLE.set(struct, 0L, index0, fieldValue);
    }

    private static final OfInt rank$LAYOUT = (OfInt)$LAYOUT.select(groupElement("rank"));

    /**
     * Layout for field:
     * {@snippet lang=c :
     * int rank
     * }
     */
    public static final OfInt rank$layout() {
        return rank$LAYOUT;
    }

    private static final long rank$OFFSET = 128;

    /**
     * Offset for field:
     * {@snippet lang=c :
     * int rank
     * }
     */
    public static final long rank$offset() {
        return rank$OFFSET;
    }

    /**
     * Getter for field:
     * {@snippet lang=c :
     * int rank
     * }
     */
    public static int rank(MemorySegment struct) {
        return struct.get(rank$LAYOUT, rank$OFFSET);
    }

    /**
     * Setter for field:
     * {@snippet lang=c :
     * int rank
     * }
     */
    public static void rank(MemorySegment struct, int fieldValue) {
        struct.set(rank$LAYOUT, rank$OFFSET, fieldValue);
    }

    private static final OfInt color$LAYOUT = (OfInt)$LAYOUT.select(groupElement("color"));

    /**
     * Layout for field:
     * {@snippet lang=c :
     * enum lit_color color
     * }
     */
    public static final OfInt color$layout() {
        return color$LAYOUT;
    }

    private static final long color$OFFSET = 132;

    /**
     * Offset for field:
     * {@snippet lang=c :
     * enum lit_color color
     * }
     */
    public static final long color$offset() {
        return color$OFFSET;
    }

    /**
     * Getter for field:
     * {@snippet lang=c :
     * enum lit_color color
     * }
     */
    public static int color(MemorySegment struct) {
        return struct.get(color$LAYOUT, color$OFFSET);
    }

    /**
     * Setter for field:
     * {@snippet lang=c :
     * enum lit_color color
     * }
     */
    public static void color(MemorySegment struct, int fieldValue) {
        struct.set(color$LAYOUT, color$OFFSET, fieldValue);
    }

    private static final SequenceLayout title$LAYOUT = (SequenceLayout)$LAYOUT.select(groupElement("title"));

    /**
     * Layout for field:
     * {@snippet lang=c :
     * char title[256]
     * }
     */
    public static final SequenceLayout title$layout() {
        return title$LAYOUT;
    }

    private static final long title$OFFSET = 136;

    /**
     * Offset for field:
     * {@snippet lang=c :
     * char title[256]
     * }
     */
    public static final long title$offset() {
        return title$OFFSET;
    }

    /**
     * Getter for field:
     * {@snippet lang=c :
     * char title[256]
     * }
     */
    public static MemorySegment title(MemorySegment struct) {
        return struct.asSlice(title$OFFSET, title$LAYOUT.byteSize());
    }

    /**
     * Setter for field:
     * {@snippet lang=c :
     * char title[256]
     * }
     */
    public static void title(MemorySegment struct, MemorySegment fieldValue) {
        MemorySegment.copy(fieldValue, 0L, struct, title$OFFSET, title$LAYOUT.byteSize());
    }

    private static long[] title$DIMS = { 256 };

    /**
     * Dimensions for array field:
     * {@snippet lang=c :
     * char title[256]
     * }
     */
    public static long[] title$dimensions() {
        return title$DIMS;
    }
    private static final VarHandle title$ELEM_HANDLE = title$LAYOUT.varHandle(sequenceElement());

    /**
     * Indexed getter for field:
     * {@snippet lang=c :
     * char title[256]
     * }
     */
    public static byte title(MemorySegment struct, long index0) {
        return (byte)title$ELEM_HANDLE.get(struct, 0L, index0);
    }

    /**
     * Indexed setter for field:
     * {@snippet lang=c :
     * char title[256]
     * }
     */
    public static void title(MemorySegment struct, long index0, byte fieldValue) {
        title$ELEM_HANDLE.set(struct, 0L, index0, fieldValue);
    }

    private static final SequenceLayout subtitle$LAYOUT = (SequenceLayout)$LAYOUT.select(groupElement("subtitle"));

    /**
     * Layout for field:
     * {@snippet lang=c :
     * char subtitle[128]
     * }
     */
    public static final SequenceLayout subtitle$layout() {
        return subtitle$LAYOUT;
    }

    private static final long subtitle$OFFSET = 392;

    /**
     * Offset for field:
     * {@snippet lang=c :
     * char subtitle[128]
     * }
     */
    public static final long subtitle$offset() {
        return subtitle$OFFSET;
    }

    /**
     * Getter for field:
     * {@snippet lang=c :
     * char subtitle[128]
     * }
     */
    public static MemorySegment subtitle(MemorySegment struct) {
        return struct.asSlice(subtitle$OFFSET, subtitle$LAYOUT.byteSize());
    }

    /**
     * Setter for field:
     * {@snippet lang=c :
     * char subtitle[128]
     * }
     */
    public static void subtitle(MemorySegment struct, MemorySegment fieldValue) {
        MemorySegment.copy(fieldValue, 0L, struct, subtitle$OFFSET, subtitle$LAYOUT.byteSize());
    }

    private static long[] subtitle$DIMS = { 128 };

    /**
     * Dimensions for array field:
     * {@snippet lang=c :
     * char subtitle[128]
     * }
     */
    public static long[] subtitle$dimensions() {
        return subtitle$DIMS;
    }
    private static final VarHandle subtitle$ELEM_HANDLE = subtitle$LAYOUT.varHandle(sequenceElement());

    /**
     * Indexed getter for field:
     * {@snippet lang=c :
     * char subtitle[128]
     * }
     */
    public static byte subtitle(MemorySegment struct, long index0) {
        return (byte)subtitle$ELEM_HANDLE.get(struct, 0L, index0);
    }

    /**
     * Indexed setter for field:
     * {@snippet lang=c :
     * char subtitle[128]
     * }
     */
    public static void subtitle(MemorySegment struct, long index0, byte fieldValue) {
        subtitle$ELEM_HANDLE.set(struct, 0L, index0, fieldValue);
    }

    private static final SequenceLayout gospel_ref$LAYOUT = (SequenceLayout)$LAYOUT.select(groupElement("gospel_ref"));

    /**
     * Layout for field:
     * {@snippet lang=c :
     * char gospel_ref[64]
     * }
     */
    public static final SequenceLayout gospel_ref$layout() {
        return gospel_ref$LAYOUT;
    }

    private static final long gospel_ref$OFFSET = 520;

    /**
     * Offset for field:
     * {@snippet lang=c :
     * char gospel_ref[64]
     * }
     */
    public static final long gospel_ref$offset() {
        return gospel_ref$OFFSET;
    }

    /**
     * Getter for field:
     * {@snippet lang=c :
     * char gospel_ref[64]
     * }
     */
    public static MemorySegment gospel_ref(MemorySegment struct) {
        return struct.asSlice(gospel_ref$OFFSET, gospel_ref$LAYOUT.byteSize());
    }

    /**
     * Setter for field:
     * {@snippet lang=c :
     * char gospel_ref[64]
     * }
     */
    public static void gospel_ref(MemorySegment struct, MemorySegment fieldValue) {
        MemorySegment.copy(fieldValue, 0L, struct, gospel_ref$OFFSET, gospel_ref$LAYOUT.byteSize());
    }

    private static long[] gospel_ref$DIMS = { 64 };

    /**
     * Dimensions for array field:
     * {@snippet lang=c :
     * char gospel_ref[64]
     * }
     */
    public static long[] gospel_ref$dimensions() {
        return gospel_ref$DIMS;
    }
    private static final VarHandle gospel_ref$ELEM_HANDLE = gospel_ref$LAYOUT.varHandle(sequenceElement());

    /**
     * Indexed getter for field:
     * {@snippet lang=c :
     * char gospel_ref[64]
     * }
     */
    public static byte gospel_ref(MemorySegment struct, long index0) {
        return (byte)gospel_ref$ELEM_HANDLE.get(struct, 0L, index0);
    }

    /**
     * Indexed setter for field:
     * {@snippet lang=c :
     * char gospel_ref[64]
     * }
     */
    public static void gospel_ref(MemorySegment struct, long index0, byte fieldValue) {
        gospel_ref$ELEM_HANDLE.set(struct, 0L, index0, fieldValue);
    }

    private static final AddressLayout gospel_text$LAYOUT = (AddressLayout)$LAYOUT.select(groupElement("gospel_text"));

    /**
     * Layout for field:
     * {@snippet lang=c :
     * char *gospel_text
     * }
     */
    public static final AddressLayout gospel_text$layout() {
        return gospel_text$LAYOUT;
    }

    private static final long gospel_text$OFFSET = 584;

    /**
     * Offset for field:
     * {@snippet lang=c :
     * char *gospel_text
     * }
     */
    public static final long gospel_text$offset() {
        return gospel_text$OFFSET;
    }

    /**
     * Getter for field:
     * {@snippet lang=c :
     * char *gospel_text
     * }
     */
    public static MemorySegment gospel_text(MemorySegment struct) {
        return struct.get(gospel_text$LAYOUT, gospel_text$OFFSET);
    }

    /**
     * Setter for field:
     * {@snippet lang=c :
     * char *gospel_text
     * }
     */
    public static void gospel_text(MemorySegment struct, MemorySegment fieldValue) {
        struct.set(gospel_text$LAYOUT, gospel_text$OFFSET, fieldValue);
    }

    private static final AddressLayout readings_url$LAYOUT = (AddressLayout)$LAYOUT.select(groupElement("readings_url"));

    /**
     * Layout for field:
     * {@snippet lang=c :
     * char *readings_url
     * }
     */
    public static final AddressLayout readings_url$layout() {
        return readings_url$LAYOUT;
    }

    private static final long readings_url$OFFSET = 592;

    /**
     * Offset for field:
     * {@snippet lang=c :
     * char *readings_url
     * }
     */
    public static final long readings_url$offset() {
        return readings_url$OFFSET;
    }

    /**
     * Getter for field:
     * {@snippet lang=c :
     * char *readings_url
     * }
     */
    public static MemorySegment readings_url(MemorySegment struct) {
        return struct.get(readings_url$LAYOUT, readings_url$OFFSET);
    }

    /**
     * Setter for field:
     * {@snippet lang=c :
     * char *readings_url
     * }
     */
    public static void readings_url(MemorySegment struct, MemorySegment fieldValue) {
        struct.set(readings_url$LAYOUT, readings_url$OFFSET, fieldValue);
    }

    private static final SequenceLayout season$LAYOUT = (SequenceLayout)$LAYOUT.select(groupElement("season"));

    /**
     * Layout for field:
     * {@snippet lang=c :
     * char season[32]
     * }
     */
    public static final SequenceLayout season$layout() {
        return season$LAYOUT;
    }

    private static final long season$OFFSET = 600;

    /**
     * Offset for field:
     * {@snippet lang=c :
     * char season[32]
     * }
     */
    public static final long season$offset() {
        return season$OFFSET;
    }

    /**
     * Getter for field:
     * {@snippet lang=c :
     * char season[32]
     * }
     */
    public static MemorySegment season(MemorySegment struct) {
        return struct.asSlice(season$OFFSET, season$LAYOUT.byteSize());
    }

    /**
     * Setter for field:
     * {@snippet lang=c :
     * char season[32]
     * }
     */
    public static void season(MemorySegment struct, MemorySegment fieldValue) {
        MemorySegment.copy(fieldValue, 0L, struct, season$OFFSET, season$LAYOUT.byteSize());
    }

    private static long[] season$DIMS = { 32 };

    /**
     * Dimensions for array field:
     * {@snippet lang=c :
     * char season[32]
     * }
     */
    public static long[] season$dimensions() {
        return season$DIMS;
    }
    private static final VarHandle season$ELEM_HANDLE = season$LAYOUT.varHandle(sequenceElement());

    /**
     * Indexed getter for field:
     * {@snippet lang=c :
     * char season[32]
     * }
     */
    public static byte season(MemorySegment struct, long index0) {
        return (byte)season$ELEM_HANDLE.get(struct, 0L, index0);
    }

    /**
     * Indexed setter for field:
     * {@snippet lang=c :
     * char season[32]
     * }
     */
    public static void season(MemorySegment struct, long index0, byte fieldValue) {
        season$ELEM_HANDLE.set(struct, 0L, index0, fieldValue);
    }

    private static final OfLong epoch_seconds$LAYOUT = (OfLong)$LAYOUT.select(groupElement("epoch_seconds"));

    /**
     * Layout for field:
     * {@snippet lang=c :
     * int64_t epoch_seconds
     * }
     */
    public static final OfLong epoch_seconds$layout() {
        return epoch_seconds$LAYOUT;
    }

    private static final long epoch_seconds$OFFSET = 632;

    /**
     * Offset for field:
     * {@snippet lang=c :
     * int64_t epoch_seconds
     * }
     */
    public static final long epoch_seconds$offset() {
        return epoch_seconds$OFFSET;
    }

    /**
     * Getter for field:
     * {@snippet lang=c :
     * int64_t epoch_seconds
     * }
     */
    public static long epoch_seconds(MemorySegment struct) {
        return struct.get(epoch_seconds$LAYOUT, epoch_seconds$OFFSET);
    }

    /**
     * Setter for field:
     * {@snippet lang=c :
     * int64_t epoch_seconds
     * }
     */
    public static void epoch_seconds(MemorySegment struct, long fieldValue) {
        struct.set(epoch_seconds$LAYOUT, epoch_seconds$OFFSET, fieldValue);
    }

    /**
     * Obtains a slice of {@code arrayParam} which selects the array element at {@code index}.
     * The returned segment has address {@code arrayParam.address() + index * layout().byteSize()}
     */
    public static MemorySegment asSlice(MemorySegment array, long index) {
        return array.asSlice(layout().byteSize() * index);
    }

    /**
     * The size (in bytes) of this struct
     */
    public static long sizeof() { return layout().byteSize(); }

    /**
     * Allocate a segment of size {@code layout().byteSize()} using {@code allocator}
     */
    public static MemorySegment allocate(SegmentAllocator allocator) {
        return allocator.allocate(layout());
    }

    /**
     * Allocate an array of size {@code elementCount} using {@code allocator}.
     * The returned segment has size {@code elementCount * layout().byteSize()}.
     */
    public static MemorySegment allocateArray(long elementCount, SegmentAllocator allocator) {
        return allocator.allocate(MemoryLayout.sequenceLayout(elementCount, layout()));
    }

    /**
     * Reinterprets {@code addr} using target {@code arena} and {@code cleanupAction) (if any).
     * The returned segment has size {@code layout().byteSize()}
     */
    public static MemorySegment reinterpret(MemorySegment addr, Arena arena, Consumer<MemorySegment> cleanup) {
        return reinterpret(addr, 1, arena, cleanup);
    }

    /**
     * Reinterprets {@code addr} using target {@code arena} and {@code cleanupAction) (if any).
     * The returned segment has size {@code elementCount * layout().byteSize()}
     */
    public static MemorySegment reinterpret(MemorySegment addr, long elementCount, Arena arena, Consumer<MemorySegment> cleanup) {
        return addr.reinterpret(layout().byteSize() * elementCount, arena, cleanup);
    }
}
