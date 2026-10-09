# MBTiles Support Guide

This guide explains how to use MBTiles files with the React Native Mapbox GL library.

## Overview

MBTiles is a specification for storing tiled map data in SQLite databases. This implementation adds support for using MBTiles files in your React Native Mapbox GL maps through a local HTTP server running on the device.

## Setup

### 1. Android Configuration

Add the network security configuration to your app's AndroidManifest.xml:

```xml
<application
    ...
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

### 2. iOS Support

Currently, MBTiles support is only available on Android. iOS support may be added in the future.

## Usage

### Initialize an MBTiles Source

```javascript
import { MBTiles } from '@rnmapbox/maps';

// Initialize from a file path
const initMBTilesFile = async () => {
  try {
    const source = await MBTiles.initFromFile(
      '/path/to/your/file.mbtiles',
      'my-source-id',
    );
    console.log('MBTiles source initialized:', source);
    return source;
  } catch (error) {
    console.error('Failed to initialize MBTiles:', error);
  }
};

// Initialize from an asset in your app bundle
const initMBTilesAsset = async () => {
  try {
    const source = await MBTiles.initFromAsset(
      'your-asset.mbtiles',
      'my-source-id',
    );
    console.log('MBTiles asset initialized:', source);
    return source;
  } catch (error) {
    console.error('Failed to initialize MBTiles asset:', error);
  }
};
```

### Use in a Map Style

After initializing the MBTiles source, you can use it in your map style:

```javascript
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import MapboxGL, { MBTiles } from '@rnmapbox/maps';

const MBTilesMap = () => {
  const [mapStyle, setMapStyle] = useState(null);

  useEffect(() => {
    const initMapStyle = async () => {
      // Initialize MBTiles source
      const source = await MBTiles.initFromFile(
        '/path/to/your/file.mbtiles',
        'my-mbtiles',
      );

      // Create a style that uses the MBTiles source
      const style = {
        version: 8,
        name: 'MBTiles Map',
        sources: {
          [source.id]: {
            type: source.isVector ? 'vector' : 'raster',
            url: source.url, // This is important - use the URL from the source
          },
        },
        layers: source.isVector
          ? [
              // For vector tiles, you need to specify sourceLayer
              {
                id: 'my-vector-layer',
                type: 'fill',
                source: source.id,
                'source-layer': 'your-source-layer', // This depends on your MBTiles file
                paint: {
                  'fill-color': 'blue',
                  'fill-opacity': 0.7,
                },
              },
            ]
          : [
              // For raster tiles, it's simpler
              {
                id: 'my-raster-layer',
                type: 'raster',
                source: source.id,
                paint: {
                  'raster-opacity': 1,
                },
              },
            ],
      };

      setMapStyle(style);
    };

    initMapStyle();

    // Clean up when component unmounts
    return () => {
      MBTiles.remove('my-mbtiles');
    };
  }, []);

  if (!mapStyle) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <MapboxGL.MapView
        style={{ flex: 1 }}
        styleJSON={JSON.stringify(mapStyle)}
      >
        <MapboxGL.Camera
          defaultSettings={{
            centerCoordinate: [0, 0],
            zoomLevel: 2,
          }}
        />
      </MapboxGL.MapView>
    </View>
  );
};

export default MBTilesMap;
```

### Managing MBTiles Sources

```javascript
// Check if a source is active
const isActive = await MBTiles.isActive('my-source-id');

// Get URL for an active source
const url = await MBTiles.getURL('my-source-id');

// Remove a source when no longer needed
await MBTiles.remove('my-source-id');

// Get list of all active sources
const activeSources = await MBTiles.getActiveSources();
```

## Troubleshooting

1. **Network Error**: If you get network errors when trying to load tiles, make sure:

   - Your network security configuration is set up correctly
   - The MBTiles file exists and is valid
   - For vector tiles, check that your 'source-layer' property matches a layer in your MBTiles file

2. **Performance Issues**: If you experience performance issues:

   - Consider using smaller MBTiles files
   - Remember to remove MBTiles sources when they're no longer needed

3. **File Access**: Make sure your app has the necessary permissions to access the file:
   ```xml
   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
   ```

## How It Works

Behind the scenes, this implementation:

1. Starts a local HTTP server on the device (on port 8888)
2. Reads tiles from the MBTiles file and serves them via the HTTP server
3. The map loads tiles from http://localhost:8888/[source-id]/{z}/{x}/{y}.[format]

This approach allows us to use MBTiles without modifying the core Mapbox library, which doesn't directly support the mbtiles:// protocol.
