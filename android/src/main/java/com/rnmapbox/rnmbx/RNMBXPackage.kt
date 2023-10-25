package com.rnmapbox.rnmbx

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.JavaScriptModule
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.rnmapbox.rnmbx.components.annotation.RNMBXCalloutManager
import com.rnmapbox.rnmbx.components.annotation.RNMBXMarkerViewManager
import com.rnmapbox.rnmbx.components.annotation.RNMBXPointAnnotationManager
import com.rnmapbox.rnmbx.components.camera.RNMBXCameraManager
import com.rnmapbox.rnmbx.components.images.RNMBXImageManager
import com.rnmapbox.rnmbx.components.images.RNMBXImageModule
import com.rnmapbox.rnmbx.components.images.RNMBXImagesManager
import com.rnmapbox.rnmbx.components.location.RNMBXNativeUserLocationManager
import com.rnmapbox.rnmbx.components.mapview.NativeMapViewModule
import com.rnmapbox.rnmbx.components.mapview.RNMBXAndroidTextureMapViewManager
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapViewManager
import com.rnmapbox.rnmbx.components.styles.RNMBXStyleImportManager
import com.rnmapbox.rnmbx.components.styles.atmosphere.RNMBXAtmosphereManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXBackgroundLayerManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXCircleLayerManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXFillExtrusionLayerManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXFillLayerManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXHeatmapLayerManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXLineLayerManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXRasterLayerManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXSkyLayerManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXSymbolLayerManager
import com.rnmapbox.rnmbx.components.styles.light.RNMBXLightManager
import com.rnmapbox.rnmbx.components.styles.sources.RNMBXImageSourceManager
import com.rnmapbox.rnmbx.components.styles.sources.RNMBXRasterDemSourceManager
import com.rnmapbox.rnmbx.components.styles.sources.RNMBXRasterSourceManager
import com.rnmapbox.rnmbx.components.styles.sources.RNMBXShapeSourceManager
import com.rnmapbox.rnmbx.components.styles.sources.RNMBXShapeSourceModule
import com.rnmapbox.rnmbx.components.styles.sources.RNMBXVectorSourceManager
import com.rnmapbox.rnmbx.components.styles.terrain.RNMBXTerrainManager
import com.rnmapbox.rnmbx.modules.RNMBXLocationModule
import com.rnmapbox.rnmbx.modules.RNMBXLogging
import com.rnmapbox.rnmbx.modules.RNMBXModule
import com.rnmapbox.rnmbx.modules.RNMBXOfflineModule
import com.rnmapbox.rnmbx.modules.RNMBXSnapshotModule
import com.rnmapbox.rnmbx.utils.ViewTagResolver

class RNMBXPackage : TurboReactPackage() {

    var viewTagResolver: ViewTagResolver? = null
    fun getViewTagResolver(context: ReactApplicationContext) : ViewTagResolver {
        val viewTagResolver = viewTagResolver
        if (viewTagResolver == null) {
            val viewTagResolver = ViewTagResolver(context)
            this.viewTagResolver = viewTagResolver
            return viewTagResolver
        }
        return viewTagResolver
    }

    override fun getModule(
        s: String,
        reactApplicationContext: ReactApplicationContext
    ): NativeModule? {
        when (s) {
            RNMBXModule.REACT_CLASS -> return RNMBXModule(reactApplicationContext)
            RNMBXLocationModule.REACT_CLASS -> return RNMBXLocationModule(reactApplicationContext)
            RNMBXOfflineModule.REACT_CLASS -> return RNMBXOfflineModule(reactApplicationContext)
            RNMBXSnapshotModule.REACT_CLASS -> return RNMBXSnapshotModule(reactApplicationContext)
            RNMBXLogging.REACT_CLASS -> return RNMBXLogging(reactApplicationContext)
            NativeMapViewModule.NAME -> return NativeMapViewModule(reactApplicationContext, getViewTagResolver(reactApplicationContext))
            RNMBXShapeSourceModule.NAME -> return RNMBXShapeSourceModule(reactApplicationContext, getViewTagResolver(reactApplicationContext))
            RNMBXImageModule.NAME -> return RNMBXImageModule(reactApplicationContext, getViewTagResolver(reactApplicationContext))
        }
        return null
    }

    @Deprecated("")
    fun createJSModules(): List<Class<out JavaScriptModule?>> {
        return emptyList()
    }

    override fun createViewManagers(reactApplicationContext: ReactApplicationContext): List<ViewManager<*, *>> {
        val managers: MutableList<ViewManager<*, *>> = ArrayList()

        // components
        managers.add(RNMBXCameraManager(reactApplicationContext))
        managers.add(RNMBXAndroidTextureMapViewManager(reactApplicationContext, getViewTagResolver(reactApplicationContext)))
        managers.add(RNMBXMapViewManager(reactApplicationContext, getViewTagResolver(reactApplicationContext)))
        managers.add(RNMBXStyleImportManager(reactApplicationContext))

        // annotations
        managers.add(RNMBXMarkerViewManager(reactApplicationContext))
        managers.add(RNMBXPointAnnotationManager(reactApplicationContext))
        managers.add(RNMBXCalloutManager())
        managers.add(RNMBXNativeUserLocationManager())

        // sources
        managers.add(RNMBXVectorSourceManager(reactApplicationContext))
        managers.add(RNMBXShapeSourceManager(reactApplicationContext))
        managers.add(RNMBXRasterDemSourceManager(reactApplicationContext))
        managers.add(RNMBXRasterSourceManager(reactApplicationContext))
        managers.add(RNMBXImageSourceManager())

        // images
        managers.add(RNMBXImagesManager(reactApplicationContext))
        managers.add(RNMBXImageManager(reactApplicationContext))

        // layers
        managers.add(RNMBXFillLayerManager())
        managers.add(RNMBXFillExtrusionLayerManager())
        managers.add(RNMBXHeatmapLayerManager())
        managers.add(RNMBXLineLayerManager())
        managers.add(RNMBXCircleLayerManager())
        managers.add(RNMBXSymbolLayerManager())
        managers.add(RNMBXRasterLayerManager())
        managers.add(RNMBXSkyLayerManager())
        managers.add(RNMBXTerrainManager())
        managers.add(RNMBXAtmosphereManager())
        managers.add(RNMBXBackgroundLayerManager())
        managers.add(RNMBXLightManager())
        return managers
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            val moduleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
            val isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            moduleInfos[RNMBXModule.REACT_CLASS] = ReactModuleInfo(
                RNMBXModule.REACT_CLASS,
                RNMBXModule.REACT_CLASS,
                false,  // canOverrideExistingModule
                false,  // needsEagerInit
                true,  // hasConstants
                false,  // isCxxModule
                false // isTurboModule
            )
            moduleInfos[RNMBXLocationModule.REACT_CLASS] = ReactModuleInfo(
                RNMBXLocationModule.REACT_CLASS,
                RNMBXLocationModule.REACT_CLASS,
                false,  // canOverrideExistingModule
                false,  // needsEagerInit
                true,  // hasConstants
                false,  // isCxxModule
                false // isTurboModule
            )
            moduleInfos[RNMBXOfflineModule.REACT_CLASS] = ReactModuleInfo(
                RNMBXOfflineModule.REACT_CLASS,
                RNMBXOfflineModule.REACT_CLASS,
                false,  // canOverrideExistingModule
                false,  // needsEagerInit
                true,  // hasConstants
                false,  // isCxxModule
                false // isTurboModule
            )
            moduleInfos[RNMBXSnapshotModule.REACT_CLASS] = ReactModuleInfo(
                RNMBXSnapshotModule.REACT_CLASS,
                RNMBXSnapshotModule.REACT_CLASS,
                false,  // canOverrideExistingModule
                false,  // needsEagerInit
                true,  // hasConstants
                false,  // isCxxModule
                false // isTurboModule
            )
            moduleInfos[RNMBXLogging.REACT_CLASS] = ReactModuleInfo(
                RNMBXLogging.REACT_CLASS,
                RNMBXLogging.REACT_CLASS,
                false,  // canOverrideExistingModule
                false,  // needsEagerInit
                true,  // hasConstants
                false,  // isCxxModule
                false // isTurboModule
            )
            moduleInfos[NativeMapViewModule.NAME] = ReactModuleInfo(
                NativeMapViewModule.NAME,
                NativeMapViewModule.NAME,
                false,  // canOverrideExistingModule
                false,  // needsEagerInit
                false,  // hasConstants
                false,  // isCxxModule
                isTurboModule // isTurboModule
            )
            moduleInfos[RNMBXShapeSourceModule.NAME] = ReactModuleInfo(
                RNMBXShapeSourceModule.NAME,
                RNMBXShapeSourceModule.NAME,
                false,  // canOverrideExistingModule
                false,  // needsEagerInit
                false,  // hasConstants
                false,  // isCxxModule
                isTurboModule // isTurboModule
            )
            moduleInfos[RNMBXImageModule.NAME] = ReactModuleInfo(
                RNMBXImageModule.NAME,
                RNMBXImageModule.NAME,
                false,  // canOverrideExistingModule
                false,  // needsEagerInit
                false,  // hasConstants
                false,  // isCxxModule
                isTurboModule // isTurboModule
            )
            moduleInfos
        }
    }
}