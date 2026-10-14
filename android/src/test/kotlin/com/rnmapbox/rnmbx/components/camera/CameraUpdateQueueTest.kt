package com.rnmapbox.rnmbx.components.camera

import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*

class CameraUpdateQueueTest {
    @Test
    fun `camera update cancels active long press before moving camera`() {
        val map = mock<RNMBXMapView>()
        val update = mock<CameraUpdateItem>()
        val stop = mock<CameraStop> {
            on { toCameraUpdate(map) } doReturn update
        }
        val queue = CameraUpdateQueue()
        queue.offer(stop)

        queue.execute(map)

        inOrder(map, update) {
            verify(map).cancelLongPressForCameraUpdate()
            verify(update).run()
        }
    }

    @Test
    fun `empty queue leaves gestures alone`() {
        val map = mock<RNMBXMapView>()
        CameraUpdateQueue().execute(map)
        verifyNoInteractions(map)
    }

    @Test
    fun `invalid camera update does not cancel gestures`() {
        val map = mock<RNMBXMapView>()
        val stop = mock<CameraStop> {
            on { toCameraUpdate(map) } doThrow IllegalArgumentException("Invalid coordinate")
        }
        val queue = CameraUpdateQueue()
        queue.offer(stop)

        assertThrows(IllegalArgumentException::class.java) { queue.execute(map) }
        verifyNoInteractions(map)
    }
}
