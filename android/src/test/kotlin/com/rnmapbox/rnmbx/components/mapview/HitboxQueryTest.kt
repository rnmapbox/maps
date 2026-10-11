package com.rnmapbox.rnmbx.components.mapview

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class HitboxQueryTest {
    @Test
    fun `default 44dp hitbox is 44 physical pixels at mdpi`() {
        val box = hitboxQueryBoxPx(
            screenXPx = 100.0,
            screenYPx = 200.0,
            hitboxWidthDp = 44.0,
            hitboxHeightDp = 44.0,
            density = 1.0,
        )

        assertEquals(78.0, box.minX, 0.001)
        assertEquals(178.0, box.minY, 0.001)
        assertEquals(122.0, box.maxX, 0.001)
        assertEquals(222.0, box.maxY, 0.001)
        assertEquals(44.0, box.maxX - box.minX, 0.001)
    }

    @Test
    fun `default 44dp hitbox grows with screen density`() {
        // Pixel-class 3x screen. Leaving the hitbox unscaled would query 44px,
        // about 15dp, instead of 44dp.
        val box = hitboxQueryBoxPx(
            screenXPx = 300.0,
            screenYPx = 450.0,
            hitboxWidthDp = 44.0,
            hitboxHeightDp = 44.0,
            density = 3.0,
        )

        assertEquals(132.0, box.maxX - box.minX, 0.001)
        assertEquals(132.0, box.maxY - box.minY, 0.001)
        assertEquals(234.0, box.minX, 0.001)
        assertEquals(384.0, box.minY, 0.001)
        assertEquals(366.0, box.maxX, 0.001)
        assertEquals(516.0, box.maxY, 0.001)
    }

    @Test
    fun `explicit hitbox is scaled the same way`() {
        // 420dpi emulator: density = 420/160 = 2.625. A 20dp hitbox is 52.5px.
        val box = hitboxQueryBoxPx(
            screenXPx = 0.0,
            screenYPx = 0.0,
            hitboxWidthDp = 20.0,
            hitboxHeightDp = 10.0,
            density = 2.625,
        )

        assertEquals(52.5, box.maxX - box.minX, 0.001)
        assertEquals(26.25, box.maxY - box.minY, 0.001)
    }
}
