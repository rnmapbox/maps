package com.rnmapbox.rnmbx

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.JavaScriptModule
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.rnmapbox.rnmbx.components.annotation.RNMBXCalloutManager
import com.rnmapbox.rnmbx.components.annotation.RNMBXMarkerViewContentManager
import com.rnmapbox.rnmbx.components.annotation.RNMBXMarkerViewManager
import com.rnmapbox.rnmbx.components.annotation.RNMBXPointAnnotationManager
import com.rnmapbox.rnmbx.components.annotation.RNMBXPointAnnotationModule
import com.rnmapbox.rnmbx.components.camera.RNMBXCameraManager
import com.rnmapbox.rnmbx.components.camera.RNMBXCameraModule
import com.rnmapbox.rnmbx.components.camera.RNMBXViewport
import com.rnmapbox.rnmbx.components.camera.RNMBXViewportManager
import com.rnmapbox.rnmbx.components.camera.RNMBXViewportModule
import com.rnmapbox.rnmbx.components.images.RNMBXImageManager
import com.rnmapbox.rnmbx.components.images.RNMBXImageModule
import com.rnmapbox.rnmbx.components.images.RNMBXImagesManager
import com.rnmapbox.rnmbx.components.location.RNMBXCustomLocationProviderManager
import com.rnmapbox.rnmbx.components.location.RNMBXNativeUserLocationManager
import com.rnmapbox.rnmbx.components.mapview.NativeMapViewModule
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapViewManager
import com.rnmapbox.rnmbx.components.styles.RNMBXStyleImportManager
import com.rnmapbox.rnmbx.components.styles.atmosphere.RNMBXAtmosphereManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXBackgroundLayerManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXCircleLayerManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXFillExtrusionLayerManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXFillLayerManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXHeatmapLayerManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXLineLayerManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXModelLayerManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXRasterLayerManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXSkyLayerManager
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXSymbolLayerManager
import com.rnmapbox.rnmbx.components.styles.light.RNMBXLightManager
import com.rnmapbox.rnmbx.components.styles.model.RNMBXModelsManager
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
import com.rnmapbox.rnmbx.modules.RNMBXOfflineModuleLegacy
import com.rnmapbox.rnmbx.modules.RNMBXSnapshotModule
import com.rnmapbox.rnmbx.modules.RNMBXTileStoreModule
import com.rnmapbox.rnmbx.shapeAnimators.RNMBXChangeLineOffsetsShapeAnimatorModule
import com.rnmapbox.rnmbx.shapeAnimators.RNMBXMovePointShapeAnimatorModule
import com.rnmapbox.rnmbx.shapeAnimators.ShapeAnimatorManager
import com.rnmapbox.rnmbx.utils.ViewTagResolver

class RNMBXPackage : TurboReactPackage() {

    var viewTagResolver: ViewTagResolver? = null
    fun getViewTagResolver(context: ReactApplicationContext, module: String) : ViewTagResolver {
        val viewTagResolver = viewTagResolver
        if (viewTagResolver == null) {
            val result = ViewTagResolver(context)
            this.viewTagResolver = result
            return result
        }
        return viewTagResolver
    }

    var shapeAnimators: ShapeAnimatorManager? = null
    fun getShapeAnimators(module: String): ShapeAnimatorManager {
        val shapeAnimators = shapeAnimators
        if (shapeAnimators == null) {
            val result = ShapeAnimatorManager()
            this.shapeAnimators = result
            return result
        }
        return shapeAnimators
    }

    fun resetViewTagResolver() {
        viewTagResolver = null
    }

    override fun getModule(
        s: String,
        reactApplicationContext: ReactApplicationContext
    ): NativeModule? {
        when (s) {
            RNMBXModule.REACT_CLASS -> return RNMBXModule(reactApplicationContext)
            RNMBXLocationModule.REACT_CLASS -> return RNMBXLocationModule(reactApplicationContext)
            RNMBXOfflineModule.REACT_CLASS -> return RNMBXOfflineModule(reactApplicationContext)
            RNMBXTileStoreModule.REACT_CLASS -> return RNMBXTileStoreModule(reactApplicationContext)
            RNMBXOfflineModuleLegacy.REACT_CLASS -> return RNMBXOfflineModuleLegacy(reactApplicationContext)
            RNMBXSnapshotModule.REACT_CLASS -> return RNMBXSnapshotModule(reactApplicationContext)
            RNMBXLogging.REACT_CLASS -> return RNMBXLogging(reactApplicationContext)
            NativeMapViewModule.NAME -> return NativeMapViewModule(reactApplicationContext, getViewTagResolver(reactApplicationContext, s))
            RNMBXCameraModule.NAME -> return RNMBXCameraModule(reactApplicationContext, getViewTagResolver(reactApplicationContext, s))
            RNMBXViewportModule.NAME -> return RNMBXViewportModule(reactApplicationContext, getViewTagResolver(reactApplicationContext, s))
            RNMBXShapeSourceModule.NAME -> return RNMBXShapeSourceModule(reactApplicationContext, getViewTagResolver(reactApplicationContext, s))
            RNMBXImageModule.NAME -> return RNMBXImageModule(reactApplicationContext, getViewTagResolver(reactApplicationContext, s))
            RNMBXPointAnnotationModule.NAME -> return RNMBXPointAnnotationModule(reactApplicationContext, getViewTagResolver(reactApplicationContext, s))
            RNMBXMovePointShapeAnimatorModule.NAME -> return RNMBXMovePointShapeAnimatorModule(reactApplicationContext, getShapeAnimators(s))
            RNMBXChangeLineOffsetsShapeAnimatorModule.NAME -> return RNMBXChangeLineOffsetsShapeAnimatorModule(reactApplicationContext, getShapeAnimators(s))
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
        managers.add(RNMBXCameraManager(reactApplicationContext, getViewTagResolver(reactApplicationContext, "RNMBXCameraManager")))
        managers.add(RNMBXViewportManager(reactApplicationContext, getViewTagResolver(reactApplicationContext, "RNMBXViewportManager")))
        managers.add(RNMBXMapViewManager(reactApplicationContext, getViewTagResolver(reactApplicationContext, "RNMBXMapViewManager")))
        managers.add(RNMBXStyleImportManager(reactApplicationContext))
        managers.add(RNMBXModelsManager(reactApplicationContext))

        // annotations
        managers.add(RNMBXMarkerViewManager(reactApplicationContext))
        managers.add(RNMBXMarkerViewContentManager(reactApplicationContext))
        managers.add(RNMBXPointAnnotationManager(reactApplicationContext, getViewTagResolver(reactApplicationContext, "RNMBXPointAnnotationManager")))
        managers.add(RNMBXCalloutManager())
        managers.add(RNMBXNativeUserLocationManager())
        managers.add(RNMBXCustomLocationProviderManager())

        // sources
        managers.add(RNMBXVectorSourceManager(reactApplicationContext))
        managers.add(RNMBXShapeSourceManager(reactApplicationContext,
            getViewTagResolver(reactApplicationContext, "RNMBXShapeSourceManager"),
            getShapeAnimators("RNMBXShapeSourceManager")
            ))
        managers.add(RNMBXRasterDemSourceManager(reactApplicationContext))
        managers.add(RNMBXRasterSourceManager(reactApplicationContext))
        managers.add(RNMBXImageSourceManager())

        // images
        managers.add(RNMBXImagesManager(reactApplicationContext))
        managers.add(RNMBXImageManager(reactApplicationContext, getViewTagResolver(reactApplicationContext, "RNMBXImageManager")))

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
        managers.add(RNMBXModelLayerManager())
        return managers
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        resetViewTagResolver()
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
                isTurboModule // isTurboModule
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
            moduleInfos[RNMBXTileStoreModule.REACT_CLASS] = ReactModuleInfo(
                RNMBXTileStoreModule.REACT_CLASS,
                RNMBXTileStoreModule.REACT_CLASS,
                false,  // canOverrideExistingModule
                false,  // needsEagerInit
                true,  // hasConstants
                false,  // isCxxModule
                false // isTurboModule
            )
            moduleInfos[RNMBXOfflineModuleLegacy.REACT_CLASS] = ReactModuleInfo(
                RNMBXOfflineModuleLegacy.REACT_CLASS,
                RNMBXOfflineModuleLegacy.REACT_CLASS,
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
            moduleInfos[RNMBXViewportModule.NAME] = ReactModuleInfo(
                RNMBXViewportModule.NAME,
                RNMBXViewportModule.NAME,
                false,  // canOverrideExistingModule
                false,  // needsEagerInit
                false,  // hasConstants
                false,  // isCxxModule
                isTurboModule // isTurboModule
            )
            moduleInfos[RNMBXCameraModule.NAME] = ReactModuleInfo(
                RNMBXCameraModule.NAME,
                RNMBXCameraModule.NAME,
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
            moduleInfos[RNMBXPointAnnotationModule.NAME] = ReactModuleInfo(
                RNMBXPointAnnotationModule.NAME,
                RNMBXPointAnnotationModule.NAME,
                false,  // canOverrideExistingModule
                false,  // needsEagerInit
                false,  // hasConstants
                false,  // isCxxModule
                isTurboModule // isTurboModule
            )
            moduleInfos[RNMBXMovePointShapeAnimatorModule.NAME] = ReactModuleInfo(
                RNMBXMovePointShapeAnimatorModule.NAME,
                RNMBXMovePointShapeAnimatorModule.NAME,
                false,
                false,
                false,
                false,
                isTurboModule
            )
            moduleInfos[RNMBXChangeLineOffsetsShapeAnimatorModule.NAME] = ReactModuleInfo(
                RNMBXChangeLineOffsetsShapeAnimatorModule.NAME,
                RNMBXChangeLineOffsetsShapeAnimatorModule.NAME,
                false,
                false,
                false,
                false,
                isTurboModule
            )
            moduleInfos
        }
    }
}