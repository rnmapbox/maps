package com.rnmapbox.rnmbx.components.camera

import com.mapbox.geojson.Point
import com.mapbox.maps.CameraOptions
import com.mapbox.maps.CameraState
import com.mapbox.maps.EdgeInsets
import com.mapbox.maps.MapboxMap
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.utils.LatLngBounds
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.anyOrNull
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class CameraStopTest {
    @Test
    fun `bounds fit expands horizontal bounds and uses resolved viewport padding`() {
        val map = mock<MapboxMap>()
        val mapView = mock<RNMBXMapView>()
        val cameraState = mock<CameraState>()
        val fittedCamera = CameraOptions.Builder()
            .center(Point.fromLngLat(-121.65, 37.0))
            .zoom(10.0)
            .bearing(15.0)
            .pitch(20.0)
            .padding(EdgeInsets(10.0, 20.0, 300.0, 40.0))
            .build()

        whenever(mapView.getMapboxMap()).thenReturn(map)
        whenever(mapView.width).thenReturn(1000)
        whenever(mapView.height).thenReturn(800)
        whenever(map.cameraState).thenReturn(cameraState)
        whenever(cameraState.center).thenReturn(Point.fromLngLat(-122.1, 37.0))
        whenever(cameraState.zoom).thenReturn(14.0)
        whenever(cameraState.bearing).thenReturn(15.0)
        whenever(cameraState.pitch).thenReturn(20.0)
        whenever(cameraState.padding).thenReturn(EdgeInsets(10.0, 20.0, 30.0, 40.0))
        whenever(
            map.cameraForCoordinates(
                any(),
                any(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull()
            )
        ).thenReturn(fittedCamera)

        val stop = CameraStop().apply {
            setBounds(
                LatLngBounds.from(37.0, -121.2, 37.0, -122.1),
                paddingLeft = null,
                paddingRight = null,
                paddingTop = null,
                paddingBottom = 300
            )
        }

        stop.toCameraUpdate(mapView)

        val coordinates = argumentCaptor<List<Point>>()
        val camera = argumentCaptor<CameraOptions>()
        val coordinatesPadding = argumentCaptor<EdgeInsets>()
        verify(map).cameraForCoordinates(
            coordinates.capture(),
            camera.capture(),
            coordinatesPadding.capture(),
            anyOrNull(),
            anyOrNull()
        )

        val southWest = coordinates.firstValue[0]
        val northEast = coordinates.firstValue[1]
        assertEquals(-122.1, southWest.longitude())
        assertEquals(-121.2, northEast.longitude())
        assertTrue(southWest.latitude() < 37.0)
        assertTrue(northEast.latitude() > 37.0)
        assertEquals(37.0, (southWest.latitude() + northEast.latitude()) / 2.0, 1e-12)

        assertEquals(0.0, coordinatesPadding.firstValue.top)
        assertEquals(0.0, coordinatesPadding.firstValue.left)
        assertEquals(0.0, coordinatesPadding.firstValue.bottom)
        assertEquals(0.0, coordinatesPadding.firstValue.right)

        val cameraPadding = camera.firstValue.padding!!
        assertEquals(10.0, cameraPadding.top)
        assertEquals(20.0, cameraPadding.left)
        assertEquals(300.0, cameraPadding.bottom)
        assertEquals(40.0, cameraPadding.right)
        assertEquals(15.0, camera.firstValue.bearing)
        assertEquals(20.0, camera.firstValue.pitch)
    }
}
