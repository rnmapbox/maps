package com.rnmapbox.rnmbx.components.location

import android.content.Context
import android.graphics.Color
import android.os.Handler
import android.os.Looper
import androidx.lifecycle.Lifecycle
import com.mapbox.maps.plugin.LocationPuck2D
import com.mapbox.maps.plugin.LocationPuck3D
import com.mapbox.maps.plugin.Plugin
import com.mapbox.maps.plugin.delegates.MapPluginProviderDelegate
import com.mapbox.maps.plugin.locationcomponent.LocationComponentPlugin
import com.mapbox.maps.plugin.locationcomponent.generated.LocationComponentSettings
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.location.LocationManager
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.mockito.kotlin.*

class LocationComponentManagerTest {
    private class Fixture {
        val location: LocationComponentPlugin = mock()
        val provider: MapPluginProviderDelegate = mock()
        val map: RNMBXMapView = mock()
        val locationManager: LocationManager = mock()
        var lifecycle = Lifecycle.State.STARTED
        var settings = LocationComponentSettings.Builder(LocationPuck2D()).build()
        var settingsWrites = 0
        val manager: LocationComponentManager

        init {
            whenever(provider.getPlugin<LocationComponentPlugin>(Plugin.MAPBOX_LOCATION_COMPONENT_PLUGIN_ID))
                .thenReturn(location)
            whenever(map.mapPlugins).thenReturn(provider)
            whenever(map.getLifecycleState()).thenAnswer { lifecycle }
            doAnswer { invocation ->
                val update = invocation.getArgument<LocationComponentSettings.Builder.() -> Unit>(0)
                settings = settings.toBuilder().apply(update).build()
                settingsWrites++
                null
            }.whenever(location).updateSettings(any())
            manager = LocationComponentManager(map, mock<Context>(), locationManager)
        }
    }

    private fun withManager(test: Fixture.() -> Unit) {
        Mockito.mockStatic(Color::class.java).use {
            Mockito.mockStatic(Looper::class.java).use {
                Mockito.mockConstruction(Handler::class.java).use {
                    Fixture().test()
                }
            }
        }
    }

    @Test
    fun `hidden puck stays disabled until following starts and stops again`() = withManager {
        manager.showNativeUserLocation(true, visible = false)
        assertFalse(settings.enabled)
        verify(locationManager, never()).startCounted()

        manager.setFollowLocation(true)
        assertTrue(settings.enabled)
        verify(locationManager).startCounted()

        manager.setFollowLocation(false)
        assertFalse(settings.enabled)
        verify(locationManager).stopCounted()
    }

    @Test
    fun `hiding and removing a puck preserves active following`() = withManager {
        manager.showNativeUserLocation(true)
        manager.setFollowLocation(true)
        manager.showNativeUserLocation(true, visible = false)
        assertTrue(settings.enabled)
        manager.showNativeUserLocation(false)
        assertTrue(settings.enabled)
        verify(locationManager, never()).stopCounted()
        manager.setFollowLocation(false)
        assertFalse(settings.enabled)
        verify(locationManager).stopCounted()
    }

    @Test
    fun `repeated hide show cycles balance location subscriptions`() = withManager {
        repeat(20) {
            manager.showNativeUserLocation(true)
            assertTrue(settings.enabled)
            manager.showNativeUserLocation(true, visible = false)
            assertFalse(settings.enabled)
        }
        verify(locationManager, times(20)).startCounted()
        verify(locationManager, times(20)).stopCounted()
        manager.onDestroy()
        verify(locationManager, times(20)).stopCounted()
    }

    @Test
    fun `manager leaves native owned puck configuration untouched during follow transitions`() = withManager {
        for (puck in listOf(LocationPuck2D(scaleExpression = "2"), LocationPuck3D(modelUri = "asset://car.glb"))) {
            settings = settings.toBuilder().apply { locationPuck = puck }.build()
            manager.showNativeUserLocation(true)
            manager.showNativeUserLocation(true, visible = false)
            manager.setFollowLocation(true)
            manager.showNativeUserLocation(true)
            assertSame(puck, settings.locationPuck)
            manager.setFollowLocation(false)
        }
    }

    @Test
    fun `shutdown does not restart the plugin or stop the location manager twice`() = withManager {
        manager.showNativeUserLocation(true)
        val writesBeforeStop = settingsWrites
        lifecycle = Lifecycle.State.CREATED
        manager.showNativeUserLocation(true, visible = false)
        assertEquals(writesBeforeStop, settingsWrites)
        verify(locationManager).stopCounted()
        manager.onDestroy()
        verify(locationManager).stopCounted()
    }
}
