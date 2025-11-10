import {
  MapView,
  Camera,
  RasterArraySource,
  RasterParticleLayer,
} from '@rnmapbox/maps';

const styles = {
  matchParent: { flex: 1 },
};

/**
 * Demonstrates particle layer animation for visualizing wind patterns.
 * This example uses a raster array source with velocity data to render
 * animated particles showing wind direction and speed.
 *
 * Note: This feature requires Mapbox Maps SDK v11.4.0 or later.
 */
export default function RasterParticleExample() {
  return (
    <MapView style={styles.matchParent}>
      <Camera
        defaultSettings={{
          centerCoordinate: [-98.0, 38.0],
          zoomLevel: 3,
        }}
      />

      {true && <RasterArraySource
        id="wind-mrt-source"
        url="mapbox://mapbox.gfs-winds"
        tileSize={512}
      >
        <RasterParticleLayer
          id="wind-particles"
          sourceLayerID="10winds"
          style={{
            rasterParticleSpeedFactor: 0.4,
            rasterParticleMaxSpeed: 70,
            rasterParticleCount: 2048,
            rasterParticleFadeOpacityFactor: 0.9,
            rasterParticleResetRateFactor: 0.4,
            rasterParticleColor: [
              'interpolate',
              ['linear'],
              ['raster-particle-speed'],
              0,
              'rgba(0, 100, 255, 0)',
              10,
              'rgba(0, 150, 255, 0.8)',
              25,
              'rgba(0, 255, 100, 0.8)',
              50,
              'rgba(255, 255, 0, 0.8)',
              75,
              'rgba(255, 140, 0, 0.8)',
              100,
              'rgba(255, 50, 0, 0.8)',
            ],
          }}
        />
      </RasterArraySource>}
    </MapView>
  );
}

/* end-example-doc */

/**
 * @typedef {import('../common/ExampleMetadata').ExampleWithMetadata} ExampleWithMetadata
 * @type {ExampleWithMetadata['metadata']}
 */
const metadata = {
  title: 'Wind Particle Animation',
  tags: ['RasterParticleLayer', 'RasterArraySource', 'v11', 'experimental'],
  docs: `
# Wind Particle Animation

This example demonstrates the RasterParticleLayer component which renders animated particles
driven by velocity data from a RasterArraySource. This is useful for visualizing phenomena
like wind patterns, ocean currents, or other directional flow data.

## Features

- **RasterArraySource**: Provides velocity/directional tile data
- **RasterParticleLayer**: Renders animated particles based on the velocity data
- **Dynamic Coloring**: Particles are colored based on their speed using a gradient
- **Configurable Properties**: Control particle count, speed, fade, and reset rate

## Requirements

- Mapbox Maps SDK v11.4.0 or later
- A raster array source with velocity data (e.g., wind data)

## Key Properties

- \`rasterParticleSpeedFactor\`: Controls the speed of particle movement
- \`rasterParticleCount\`: Number of particles per tile
- \`rasterParticleColor\`: Color gradient based on particle velocity
- \`rasterParticleMaxSpeed\`: Maximum velocity for normalization
- \`rasterParticleFadeOpacityFactor\`: Controls the length of particle trails

## Use Cases

- Weather visualization (wind patterns)
- Ocean current mapping
- Air quality flow patterns
- Traffic flow visualization (with appropriate data)
`,
};
RasterParticleExample.metadata = metadata;
