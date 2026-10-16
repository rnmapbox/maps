package com.rnmapbox.rnmbx.modules

import android.util.Log
import android.net.Uri
import android.os.Build
import com.facebook.react.bridge.*
import com.rnmapbox.rnmbx.utils.MBTilesServer
import com.rnmapbox.rnmbx.utils.MBTilesSource
import com.rnmapbox.rnmbx.utils.MBTilesSourceException
import java.io.File

class RNMBXMBTilesModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val TAG = "RNMBXMBTilesModule"
    private val activeSources = mutableMapOf<String, MBTilesSource>()

    override fun getName(): String {
        return "RNMBXMBTiles"
    }

    /**
     * Initialize and activate an MBTiles source from a file path
     */
    @ReactMethod
    fun initMBTilesSource(filePath: String, sourceId: String, promise: Promise) {
        try {
            // Note: In v11, we don't need to set Mapbox.isConnected anymore
            // The HTTP requests to localhost will work without this setting

            // Handle Android file paths
            val resolvedPath = if (filePath.startsWith("file://")) {
                Uri.parse(filePath).path ?: filePath.substring(7)
            } else {
                filePath
            }

            // Check if file exists
            val file = File(resolvedPath)
            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "MBTiles file not found at path: $resolvedPath")
                return
            }

            // Create and activate the MBTiles source
            val mbSource = MBTilesSource(resolvedPath, sourceId).apply { activate() }
            activeSources[sourceId] = mbSource

            // Return source information
            val resultMap = Arguments.createMap().apply {
                putString("id", mbSource.id)
                putString("url", mbSource.url)
                putBoolean("isVector", mbSource.isVector)
                putString("format", mbSource.format)
                mbSource.minZoom?.let { putDouble("minZoom", it.toDouble()) }
                mbSource.maxZoom?.let { putDouble("maxZoom", it.toDouble()) }
            }
            promise.resolve(resultMap)

        } catch (e: MBTilesSourceException.CouldNotReadFileException) {
            promise.reject("ERROR_READING_FILE", "Could not read the MBTiles file")
        } catch (e: MBTilesSourceException.UnsupportedFormatException) {
            promise.reject("UNSUPPORTED_FORMAT", "MBTiles format is not supported")
        } catch (e: Exception) {
            promise.reject("UNKNOWN_ERROR", "Error initializing MBTiles source: ${e.localizedMessage}")
        }
    }

    /**
     * Initialize an MBTiles source from an asset in the app bundle
     */
    @ReactMethod
    fun initMBTilesSourceFromAsset(assetName: String, sourceId: String, promise: Promise) {
        try {
            // Note: In v11, we don't need to set Mapbox.isConnected anymore
            // The HTTP requests to localhost will work without this setting

            // Copy from asset to local file
            val filePath = MBTilesSource.readAsset(reactContext, assetName)

            // Create and activate the MBTiles source
            val mbSource = MBTilesSource(filePath, sourceId).apply { activate() }
            activeSources[sourceId] = mbSource

            // Return source information
            val resultMap = Arguments.createMap().apply {
                putString("id", mbSource.id)
                putString("url", mbSource.url)
                putBoolean("isVector", mbSource.isVector)
                putString("format", mbSource.format)
                mbSource.minZoom?.let { putDouble("minZoom", it.toDouble()) }
                mbSource.maxZoom?.let { putDouble("maxZoom", it.toDouble()) }
            }
            promise.resolve(resultMap)

        } catch (e: MBTilesSourceException.CouldNotReadFileException) {
            promise.reject("ERROR_READING_FILE", "Could not read the MBTiles asset")
        } catch (e: MBTilesSourceException.UnsupportedFormatException) {
            promise.reject("UNSUPPORTED_FORMAT", "MBTiles format is not supported")
        } catch (e: Exception) {
            promise.reject("UNKNOWN_ERROR", "Error initializing MBTiles source from asset: ${e.localizedMessage}")
        }
    }

    /**
     * Initialize an MBTiles source from a remote URL (downloads first)
     */
    @ReactMethod
    fun initMBTilesSourceFromURL(urlString: String, sourceId: String, promise: Promise) {
        Thread {
            try {
                val url = java.net.URL(urlString)

                // Generate a filename from the URL or sourceId
                val fileName = if (sourceId.isEmpty()) {
                    url.path.substringAfterLast("/")
                } else {
                    "$sourceId.mbtiles"
                }

                // Get the destination path
                val destinationFile = File(reactContext.filesDir, fileName)

                // Download the file
                url.openStream().use { input ->
                    java.io.FileOutputStream(destinationFile).use { output ->
                        input.copyTo(output)
                    }
                }

                // Create and activate the MBTiles source
                val effectiveSourceId = if (sourceId.isEmpty()) {
                    fileName.substringBefore(".")
                } else {
                    sourceId
                }
                val mbSource = MBTilesSource(destinationFile.absolutePath, effectiveSourceId).apply { activate() }
                activeSources[effectiveSourceId] = mbSource

                // Return source information
                val resultMap = Arguments.createMap().apply {
                    putString("id", mbSource.id)
                    putString("url", mbSource.url)
                    putBoolean("isVector", mbSource.isVector)
                    putString("format", mbSource.format)
                    mbSource.minZoom?.let { putDouble("minZoom", it.toDouble()) }
                    mbSource.maxZoom?.let { putDouble("maxZoom", it.toDouble()) }
                }
                promise.resolve(resultMap)

            } catch (e: MBTilesSourceException.CouldNotReadFileException) {
                promise.reject("ERROR_READING_FILE", "Could not read the downloaded MBTiles file")
            } catch (e: MBTilesSourceException.UnsupportedFormatException) {
                promise.reject("UNSUPPORTED_FORMAT", "MBTiles format is not supported")
            } catch (e: java.net.MalformedURLException) {
                promise.reject("INVALID_URL", "Invalid URL: $urlString")
            } catch (e: java.io.IOException) {
                promise.reject("DOWNLOAD_ERROR", "Failed to download MBTiles file: ${e.localizedMessage}")
            } catch (e: Exception) {
                promise.reject("UNKNOWN_ERROR", "Error initializing MBTiles source from URL: ${e.localizedMessage}")
            }
        }.start()
    }

    /**
     * Get the HTTP URL for an active MBTiles source to use in style json
     */
    @ReactMethod
    fun getMBTilesURL(sourceId: String, promise: Promise) {
        val mbSource = activeSources[sourceId]
        if (mbSource != null) {
            promise.resolve(mbSource.url)
        } else {
            promise.reject("SOURCE_NOT_FOUND", "MBTiles source with ID '$sourceId' is not active")
        }
    }

    /**
     * Stop and remove an MBTiles source
     */
    @ReactMethod
    fun removeMBTilesSource(sourceId: String, promise: Promise) {
        val mbSource = activeSources[sourceId]
        if (mbSource != null) {
            mbSource.deactivate()
            activeSources.remove(sourceId)
            promise.resolve(true)
        } else {
            promise.resolve(false)
        }
    }

    /**
     * Check if an MBTiles source is currently active
     */
    @ReactMethod
    fun isMBTilesSourceActive(sourceId: String, promise: Promise) {
        promise.resolve(activeSources.containsKey(sourceId))
    }

    /**
     * List all active MBTiles sources
     */
    @ReactMethod
    fun getActiveMBTilesSources(promise: Promise) {
        val sources = Arguments.createArray()
        activeSources.forEach { (id, _) ->
            sources.pushString(id)
        }
        promise.resolve(sources)
    }

    /**
     * Manually start the MBTiles server
     */
    @ReactMethod
    fun startServer(promise: Promise) {
        try {
            MBTilesServer.start()
            promise.resolve(MBTilesServer.isRunning)
        } catch (e: Exception) {
            promise.reject("SERVER_ERROR", "Error starting MBTiles server: ${e.localizedMessage}")
        }
    }

    /**
     * Manually stop the MBTiles server
     */
    @ReactMethod
    fun stopServer(promise: Promise) {
        try {
            MBTilesServer.stop()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SERVER_ERROR", "Error stopping MBTiles server: ${e.localizedMessage}")
        }
    }

    /**
     * Check if the MBTiles server is running
     */
    @ReactMethod
    fun isServerRunning(promise: Promise) {
        promise.resolve(MBTilesServer.isRunning)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN built-in Event Emitter Calls
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN built-in Event Emitter Calls
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        // Cleanup when React context is destroyed
        activeSources.forEach { (_, source) ->
            source.deactivate()
        }
        activeSources.clear()
    }
}
