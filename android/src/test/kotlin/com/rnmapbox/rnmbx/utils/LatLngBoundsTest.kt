package com.rnmapbox.rnmbx.utils

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class LatLngBoundsTest {
    @Test
    fun `horizontal camera bounds enclose the original line without shifting its center`() {
        val bounds = LatLngBounds.from(37.0, -121.2, 37.0, -122.1)
        val cameraBounds = bounds.toCameraBounds()

        assertTrue(cameraBounds.southwest.latitude() < 37.0)
        assertTrue(cameraBounds.northeast.latitude() > 37.0)
        assertEquals(37.0, (cameraBounds.southwest.latitude() + cameraBounds.northeast.latitude()) / 2, 1e-12)
        assertEquals(-122.1, cameraBounds.southwest.longitude())
        assertEquals(-121.2, cameraBounds.northeast.longitude())

        // Camera constraints must still use the exact bounds after a fit.
        assertEquals(37.0, bounds.toBounds().southwest.latitude())
        assertEquals(37.0, bounds.toBounds().northeast.latitude())
    }

    @Test
    fun `vertical camera bounds expand longitude without shifting their center`() {
        val bounds = LatLngBounds.from(37.1, -121.1, 37.0, -121.1)
        val cameraBounds = bounds.toCameraBounds()

        assertEquals(37.0, cameraBounds.southwest.latitude())
        assertEquals(37.1, cameraBounds.northeast.latitude())
        assertTrue(cameraBounds.southwest.longitude() < -121.1)
        assertTrue(cameraBounds.northeast.longitude() > -121.1)
        assertEquals(-121.1, (cameraBounds.southwest.longitude() + cameraBounds.northeast.longitude()) / 2, 1e-12)
    }

    @Test
    fun `point and very thin nonzero bounds remain fit-safe`() {
        val point = LatLngBounds.from(37.0, -121.1, 37.0, -121.1).toCameraBounds()
        assertTrue(point.southwest.latitude() < point.northeast.latitude())
        assertTrue(point.southwest.longitude() < point.northeast.longitude())

        val thin = LatLngBounds.from(37.00000001, -121.2, 37.0, -122.1)
        assertEquals(thin.toBounds(), thin.toCameraBounds())
    }

    @Test
    fun `expanding a horizontal fit never exceeds valid latitudes`() {
        for (latitude in listOf(-90.0, 90.0)) {
            val cameraBounds = LatLngBounds.from(latitude, 1.0, latitude, -1.0).toCameraBounds()
            assertTrue(cameraBounds.southwest.latitude() >= -90.0)
            assertTrue(cameraBounds.northeast.latitude() <= 90.0)
            assertTrue(cameraBounds.southwest.latitude() < cameraBounds.northeast.latitude())
        }
    }
}
