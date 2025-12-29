package com.rnmapbox.rnmbx.utils

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.util.Log
import com.mapbox.maps.extension.style.sources.Source
import com.mapbox.maps.extension.style.sources.TileSet
import com.mapbox.maps.extension.style.sources.generated.RasterSource
import com.mapbox.maps.extension.style.sources.generated.VectorSource
import java.io.File
import java.io.FileOutputStream
import kotlin.properties.Delegates

/*
 *  Mapbox Source backend by localhost tile server
 */

sealed class MBTilesSourceException : Exception() {
    class CouldNotReadFileException : MBTilesSourceException()
    class UnsupportedFormatException : MBTilesSourceException()
}

class MBTilesSource(filePath: String, sourceId: String? = null) {
    private val TAG = "MBTilesSource"

    val id = sourceId ?: filePath.substringAfterLast("/").substringBefore(".")
    val url get() = "http://localhost:${MBTilesServer.port}/$id/{z}/{x}/{y}.$format"
    private val db: SQLiteDatabase = try {
        SQLiteDatabase.openDatabase(filePath, null, SQLiteDatabase.OPEN_READONLY)
    } catch (e: RuntimeException) {
        Log.e(TAG, "Failed to open MBTiles file: ${e.localizedMessage}")
        throw MBTilesSourceException.CouldNotReadFileException()
    }

    // Lazy initialization of source instance based on tile format
    val instance: Source by lazy {
        if (isVector) {
            VectorSource.Builder(id)
                .tiles(listOf(url))
                .build()
        } else {
            RasterSource.Builder(id)
                .tiles(listOf(url))
                .tileSize(256)
                .build()
        }
    }

    var isVector by Delegates.notNull<Boolean>()
    lateinit var format: String
    // Optional metadata properties
    var minZoom: Float? = null
    var maxZoom: Float? = null

    init {
        try {
            // Retrieve format from metadata table
            format = db.query(
                "metadata", null, "name = ?",
                arrayOf("format"), null, null, null
            ).use { cursor ->
                if (cursor.count == 0) {
                    throw MBTilesSourceException.UnsupportedFormatException()
                }
                cursor.moveToFirst()
                val index = cursor.getColumnIndex("value")
                cursor.getString(index)
            }

            // Determine if this is vector or raster based on format
            isVector = when (format) {
                in validVectorFormats -> true
                in validRasterFormats -> false
                else -> throw MBTilesSourceException.UnsupportedFormatException()
            }

            // Try to read additional metadata
            try {
                db.query(
                    "metadata", null, "name = ?",
                    arrayOf("minzoom"), null, null, null
                ).use { cursor ->
                    if (cursor.count > 0) {
                        cursor.moveToFirst()
                        val index = cursor.getColumnIndex("value")
                        minZoom = cursor.getString(index).toFloatOrNull()
                    }
                }

                db.query(
                    "metadata", null, "name = ?",
                    arrayOf("maxzoom"), null, null, null
                ).use { cursor ->
                    if (cursor.count > 0) {
                        cursor.moveToFirst()
                        val index = cursor.getColumnIndex("value")
                        maxZoom = cursor.getString(index).toFloatOrNull()
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "Error reading additional metadata: ${e.localizedMessage}")
                // Continue without metadata
            }

        } catch (error: MBTilesSourceException) {
            Log.e(TAG, "Error initializing MBTilesSource: ${error.localizedMessage}")
            throw error
        }
    }

    fun getTile(z: Int, x: Int, y: Int): ByteArray? {
        return db.query(
            "tiles", null, "zoom_level = ? AND tile_column = ? AND tile_row = ?",
            arrayOf("$z", "$x", "$y"), null, null, null
        ).use { cursor ->
            if (cursor.count == 0) return null

            cursor.moveToFirst()
            val index = cursor.getColumnIndex("tile_data")
            cursor.getBlob(index)
        }
    }

    fun activate() = with(MBTilesServer) {
        sources[id] = this@MBTilesSource
        if (!isRunning) start()
    }

    fun deactivate() = with(MBTilesServer) {
        sources.remove(id)

        if (isRunning && sources.isEmpty()) {
            stop()
        }

        // Close the database connection
        try {
            db.close()
        } catch (e: Exception) {
            Log.e(TAG, "Error closing database for source $id: ${e.localizedMessage}")
        }
    }

    companion object {
        val validRasterFormats = listOf("jpg", "png")
        val validVectorFormats = listOf("pbf", "mvt")

        fun readAsset(context: Context, asset: String): String =
            context.assets.open(asset).use { inputStream ->
                val path = context.getDatabasePath(asset).path
                val outputFile = File(path)
                FileOutputStream(outputFile).use { outputStream ->
                    inputStream.copyTo(outputStream)
                    outputStream.flush()
                }
                return path
            }
    }
}