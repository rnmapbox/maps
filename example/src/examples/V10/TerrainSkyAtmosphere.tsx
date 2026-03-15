import { useRef, useState } from 'react';
import { Button, View } from 'react-native';
import {
  MapView,
  SkyLayer,
  Logger,
  Terrain,
  RasterDemSource,
  Atmosphere,
  Camera,
} from '@rnmapbox/maps';

Logger.setLogLevel('verbose');

const TerrainSkyAtmosphere = () => {
  const cameraRef = useRef<Camera>(null);
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  // Toggle between styled and no-props to reproduce the mReactStyle!! crash on Android new-arch
  const [atmosphereStyled, setAtmosphereStyled] = useState(true);

  return (
    <>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Button
          title={showAtmosphere ? 'Remove Atmosphere' : 'Add Atmosphere'}
          onPress={() => setShowAtmosphere((v) => !v)}
        />
        <Button
          title={atmosphereStyled ? 'Atmosphere: no props' : 'Atmosphere: styled'}
          onPress={() => setAtmosphereStyled((v) => !v)}
        />
      </View>
      <MapView
        style={{ flex: 1 }}
        styleURL={'mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y'}
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={[-114.34411, 32.6141]}
          zoomLevel={13.1}
          heading={80}
          pitch={85}
        />
        <RasterDemSource
          id="mapbox-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={514}
          maxZoomLevel={14}
        >
          {showAtmosphere &&
            (atmosphereStyled ? (
              <Atmosphere
                style={{
                  color: 'rgb(186, 210, 235)',
                  highColor: 'rgb(36, 92, 223)',
                  horizonBlend: 0.02,
                  spaceColor: 'rgb(11, 11, 25)',
                  starIntensity: 0.6,
                }}
              />
            ) : (
              // No style prop — crashed on Android new-arch before the mReactStyle!! fix
              <Atmosphere />
            ))}
          <SkyLayer
            id="sky-layer"
            style={{
              skyType: 'atmosphere',
              skyAtmosphereSun: [0.0, 0.0],
              skyAtmosphereSunIntensity: 15.0,
            }}
          />
          <Terrain style={{ exaggeration: 1.5 }} />
        </RasterDemSource>
      </MapView>
    </>
  );
};

export default TerrainSkyAtmosphere;

/* end-example-doc */

/** @type ExampleWithMetadata['metadata'] */
const metadata = {
  title: 'Terrain, Sky, & Atmosphere',
  tags: ['RasterDemSource', 'Terrain', 'Atmosphere', 'SkyLayer'],
  docs: `
Demonstrates use of Terrain, Atmosphere and SkyLayer.

Toggle buttons let you remove/re-add the atmosphere and switch between
a styled atmosphere and one with no props (the no-props case crashed on
Android new-arch before the mReactStyle!! fix).
`,
};
TerrainSkyAtmosphere.metadata = metadata;
