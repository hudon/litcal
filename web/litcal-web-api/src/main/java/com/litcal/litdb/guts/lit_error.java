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
 * struct lit_error {
 *     enum lit_status status;
 *     char message[256];
 * }
 * }
 */
public class lit_error {

    lit_error() {
        // Should not be called directly
    }

    private static final GroupLayout $LAYOUT = MemoryLayout.structLayout(
        litdb_h.C_INT.withName("status"),
        MemoryLayout.sequenceLayout(256, litdb_h.C_CHAR).withName("message")
    ).withName("lit_error");

    /**
     * The layout of this struct
     */
    public static final GroupLayout layout() {
        return $LAYOUT;
    }

    private static final OfInt status$LAYOUT = (OfInt)$LAYOUT.select(groupElement("status"));

    /**
     * Layout for field:
     * {@snippet lang=c :
     * enum lit_status status
     * }
     */
    public static final OfInt status$layout() {
        return status$LAYOUT;
    }

    private static final long status$OFFSET = 0;

    /**
     * Offset for field:
     * {@snippet lang=c :
     * enum lit_status status
     * }
     */
    public static final long status$offset() {
        return status$OFFSET;
    }

    /**
     * Getter for field:
     * {@snippet lang=c :
     * enum lit_status status
     * }
     */
    public static int status(MemorySegment struct) {
        return struct.get(status$LAYOUT, status$OFFSET);
    }

    /**
     * Setter for field:
     * {@snippet lang=c :
     * enum lit_status status
     * }
     */
    public static void status(MemorySegment struct, int fieldValue) {
        struct.set(status$LAYOUT, status$OFFSET, fieldValue);
    }

    private static final SequenceLayout message$LAYOUT = (SequenceLayout)$LAYOUT.select(groupElement("message"));

    /**
     * Layout for field:
     * {@snippet lang=c :
     * char message[256]
     * }
     */
    public static final SequenceLayout message$layout() {
        return message$LAYOUT;
    }

    private static final long message$OFFSET = 4;

    /**
     * Offset for field:
     * {@snippet lang=c :
     * char message[256]
     * }
     */
    public static final long message$offset() {
        return message$OFFSET;
    }

    /**
     * Getter for field:
     * {@snippet lang=c :
     * char message[256]
     * }
     */
    public static MemorySegment message(MemorySegment struct) {
        return struct.asSlice(message$OFFSET, message$LAYOUT.byteSize());
    }

    /**
     * Setter for field:
     * {@snippet lang=c :
     * char message[256]
     * }
     */
    public static void message(MemorySegment struct, MemorySegment fieldValue) {
        MemorySegment.copy(fieldValue, 0L, struct, message$OFFSET, message$LAYOUT.byteSize());
    }

    private static long[] message$DIMS = { 256 };

    /**
     * Dimensions for array field:
     * {@snippet lang=c :
     * char message[256]
     * }
     */
    public static long[] message$dimensions() {
        return message$DIMS;
    }
    private static final VarHandle message$ELEM_HANDLE = message$LAYOUT.varHandle(sequenceElement());

    /**
     * Indexed getter for field:
     * {@snippet lang=c :
     * char message[256]
     * }
     */
    public static byte message(MemorySegment struct, long index0) {
        return (byte)message$ELEM_HANDLE.get(struct, 0L, index0);
    }

    /**
     * Indexed setter for field:
     * {@snippet lang=c :
     * char message[256]
     * }
     */
    public static void message(MemorySegment struct, long index0, byte fieldValue) {
        message$ELEM_HANDLE.set(struct, 0L, index0, fieldValue);
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
