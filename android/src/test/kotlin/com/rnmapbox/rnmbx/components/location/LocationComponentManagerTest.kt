package com.rnmapbox.rnmbx.components.location

import android.content.Context
import android.graphics.Color
import android.os.Handler
import android.os.Looper
import androidx.lifecycle.Lifecycle
import com.mapbox.maps.plugin.LocationPuck2D
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
        var settings = LocationComponentSettings.Builder(LocationPuck2D()).build()
        val manager: LocationComponentManager

        init {
            whenever(provider.getPlugin<LocationComponentPlugin>(Plugin.MAPBOX_LOCATION_COMPONENT_PLUGIN_ID))
                .thenReturn(location)
            whenever(map.mapPlugins).thenReturn(provider)
            whenever(map.getLifecycleState()).thenReturn(Lifecycle.State.STARTED)
            doAnswer { invocation ->
                val update = invocation.getArgument<LocationComponentSettings.Builder.() -> Unit>(0)
                settings = settings.toBuilder().apply(update).build()
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
    fun `hiding a puck preserves active following`() = withManager {
        manager.showNativeUserLocation(true, visible = true)
        manager.setFollowLocation(true)
        manager.showNativeUserLocation(true, visible = false)
        assertTrue(settings.enabled)
        verify(locationManager, never()).stopCounted()
    }

    @Test
    fun `repeated hide show cycles balance location subscriptions`() = withManager {
        repeat(20) {
            manager.showNativeUserLocation(true, visible = true)
            assertTrue(settings.enabled)
            manager.showNativeUserLocation(true, visible = false)
            assertFalse(settings.enabled)
        }
        verify(locationManager, times(20)).startCounted()
        verify(locationManager, times(20)).stopCounted()
    }

}
