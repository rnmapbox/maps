package com.rnmapbox.rnmbx.components.mapview

import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Test

class RNMBXMapViewFactoryTest {
    private val factory: Factory = { _, _ -> null }

    @AfterEach
    fun tearDown() {
        RNMBXMapViewFactory.factories.clear()
    }

    @Test
    fun `register accepts an id without options`() {
        RNMBXMapViewFactory.register("custom", factory)

        assertSame(factory, RNMBXMapViewFactory.get("custom"))
        assertSame(factory, RNMBXMapViewFactory.get("custom:options"))
    }

    @Test
    fun `register strips options from the id`() {
        RNMBXMapViewFactory.register("custom:options", factory)

        assertSame(factory, RNMBXMapViewFactory.get("custom"))
        assertNull(RNMBXMapViewFactory.get("other"))
    }

    @Suppress("DEPRECATION")
    @Test
    fun `regiser is an alias of register`() {
        RNMBXMapViewFactory.regiser("custom", factory)

        assertSame(factory, RNMBXMapViewFactory.get("custom"))
    }
}
