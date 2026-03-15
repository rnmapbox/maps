import { useRef, useState } from 'react';
import { Button } from 'react-native';
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

const ATMOSPHERE_COLORS = [
  {
    label: 'Day',
    color: 'rgb(186, 210, 235)',
    highColor: 'rgb(36, 92, 223)',
    spaceColor: 'rgb(11, 11, 25)',
    starIntensity: 0.6,
  },
  {
    label: 'Sunset',
    color: 'rgb(255, 200, 150)',
    highColor: 'rgb(200, 100, 50)',
    spaceColor: 'rgb(20, 10, 30)',
    starIntensity: 0.8,
  },
  {
    label: 'Blue',
    color: '#def',
    highColor: '#def',
    spaceColor: '#def',
    starIntensity: 1.0,
  },
];

const TerrainSkyAtmosphere = () => {
  const cameraRef = useRef<Camera>(null);
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  const [colorIdx, setColorIdx] = useState(0);

  return (
    <>
      <Button
        title="Change"
        onPress={() =>
          cameraRef.current?.setCamera({
            heading: 60,
            zoomLevel: 13.5,
            animationDuration: 20000,
          })
        }
      />
      <Button
        title={showAtmosphere ? 'Remove Atmosphere' : 'Add Atmosphere'}
        onPress={() => setShowAtmosphere((v) => !v)}
      />
      <Button
        title={`Atmosphere Color: ${ATMOSPHERE_COLORS[colorIdx].label}`}
        onPress={() => setColorIdx((i) => (i + 1) % ATMOSPHERE_COLORS.length)}
      />
      <MapView
        style={{ flex: 1 }}
        styleURL={'mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y'}
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={[
            // -74.00597, 40.71427
            // -122.4189591, 37.6614238,
            -114.34411, 32.6141,
          ]}
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
          {showAtmosphere && (
            <Atmosphere
              style={{
                color: ATMOSPHERE_COLORS[colorIdx].color,
                highColor: ATMOSPHERE_COLORS[colorIdx].highColor,
                horizonBlend: 0.02,
                spaceColor: ATMOSPHERE_COLORS[colorIdx].spaceColor,
                starIntensity: ATMOSPHERE_COLORS[colorIdx].starIntensity,
              }}
            />
          )}
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
Demostrates use of Terrain, Atmosphere and SkyLayer.
`,
};
TerrainSkyAtmosphere.metadata = metadata;
