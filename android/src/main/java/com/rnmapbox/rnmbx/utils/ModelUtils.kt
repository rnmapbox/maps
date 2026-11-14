package com.rnmapbox.rnmbx.utils

import android.content.Context
import java.io.File

object ModelUtils {
    private const val LOG_TAG = "ModelUtils"
    private val GLB_MAGIC = "glTF".toByteArray()
    private val resolvedRawResources = mutableMapOf<String, String>()

    // Release builds ship `require`d models as res/raw resources named like `src_assets_car`, which Mapbox can't load, so copy them to a file with a model extension.
    @Synchronized
    fun resolveUri(context: Context, uri: String): String {
        if (uri.contains("://")) {
            return uri
        }
        resolvedRawResources[uri]?.let { return it }

        val resId = context.resources.getIdentifier(uri, "raw", context.packageName)
        if (resId == 0) {
            return uri
        }
        return try {
            val bytes = context.resources.openRawResource(resId).use { it.readBytes() }
            val extension = if (bytes.take(GLB_MAGIC.size) == GLB_MAGIC.toList()) "glb" else "gltf"
            val dir = File(context.cacheDir, "rnmbx-models").apply { mkdirs() }
            val file = File(dir, "$uri.$extension")
            file.writeBytes(bytes)
            "file://${file.absolutePath}".also { resolvedRawResources[uri] = it }
        } catch (e: Exception) {
            Logger.e(LOG_TAG, "Failed to copy model resource $uri", e)
            uri
        }
    }
}
