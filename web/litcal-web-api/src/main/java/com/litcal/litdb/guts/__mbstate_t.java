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
 * union {
 *     char __mbstate8[128];
 *     long long _mbstateL;
 * }
 * }
 */
public class __mbstate_t {

    __mbstate_t() {
        // Should not be called directly
    }

    private static final GroupLayout $LAYOUT = MemoryLayout.unionLayout(
        MemoryLayout.sequenceLayout(128, litdb_h.C_CHAR).withName("__mbstate8"),
        litdb_h.C_LONG_LONG.withName("_mbstateL")
    ).withName("$anon$54:9");

    /**
     * The layout of this union
     */
    public static final GroupLayout layout() {
        return $LAYOUT;
    }

    private static final SequenceLayout __mbstate8$LAYOUT = (SequenceLayout)$LAYOUT.select(groupElement("__mbstate8"));

    /**
     * Layout for field:
     * {@snippet lang=c :
     * char __mbstate8[128]
     * }
     */
    public static final SequenceLayout __mbstate8$layout() {
        return __mbstate8$LAYOUT;
    }

    private static final long __mbstate8$OFFSET = 0;

    /**
     * Offset for field:
     * {@snippet lang=c :
     * char __mbstate8[128]
     * }
     */
    public static final long __mbstate8$offset() {
        return __mbstate8$OFFSET;
    }

    /**
     * Getter for field:
     * {@snippet lang=c :
     * char __mbstate8[128]
     * }
     */
    public static MemorySegment __mbstate8(MemorySegment union) {
        return union.asSlice(__mbstate8$OFFSET, __mbstate8$LAYOUT.byteSize());
    }

    /**
     * Setter for field:
     * {@snippet lang=c :
     * char __mbstate8[128]
     * }
     */
    public static void __mbstate8(MemorySegment union, MemorySegment fieldValue) {
        MemorySegment.copy(fieldValue, 0L, union, __mbstate8$OFFSET, __mbstate8$LAYOUT.byteSize());
    }

    private static long[] __mbstate8$DIMS = { 128 };

    /**
     * Dimensions for array field:
     * {@snippet lang=c :
     * char __mbstate8[128]
     * }
     */
    public static long[] __mbstate8$dimensions() {
        return __mbstate8$DIMS;
    }
    private static final VarHandle __mbstate8$ELEM_HANDLE = __mbstate8$LAYOUT.varHandle(sequenceElement());

    /**
     * Indexed getter for field:
     * {@snippet lang=c :
     * char __mbstate8[128]
     * }
     */
    public static byte __mbstate8(MemorySegment union, long index0) {
        return (byte)__mbstate8$ELEM_HANDLE.get(union, 0L, index0);
    }

    /**
     * Indexed setter for field:
     * {@snippet lang=c :
     * char __mbstate8[128]
     * }
     */
    public static void __mbstate8(MemorySegment union, long index0, byte fieldValue) {
        __mbstate8$ELEM_HANDLE.set(union, 0L, index0, fieldValue);
    }

    private static final OfLong _mbstateL$LAYOUT = (OfLong)$LAYOUT.select(groupElement("_mbstateL"));

    /**
     * Layout for field:
     * {@snippet lang=c :
     * long long _mbstateL
     * }
     */
    public static final OfLong _mbstateL$layout() {
        return _mbstateL$LAYOUT;
    }

    private static final long _mbstateL$OFFSET = 0;

    /**
     * Offset for field:
     * {@snippet lang=c :
     * long long _mbstateL
     * }
     */
    public static final long _mbstateL$offset() {
        return _mbstateL$OFFSET;
    }

    /**
     * Getter for field:
     * {@snippet lang=c :
     * long long _mbstateL
     * }
     */
    public static long _mbstateL(MemorySegment union) {
        return union.get(_mbstateL$LAYOUT, _mbstateL$OFFSET);
    }

    /**
     * Setter for field:
     * {@snippet lang=c :
     * long long _mbstateL
     * }
     */
    public static void _mbstateL(MemorySegment union, long fieldValue) {
        union.set(_mbstateL$LAYOUT, _mbstateL$OFFSET, fieldValue);
    }

    /**
     * Obtains a slice of {@code arrayParam} which selects the array element at {@code index}.
     * The returned segment has address {@code arrayParam.address() + index * layout().byteSize()}
     */
    public static MemorySegment asSlice(MemorySegment array, long index) {
        return array.asSlice(layout().byteSize() * index);
    }

    /**
     * The size (in bytes) of this union
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

