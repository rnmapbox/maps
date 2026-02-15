import { useState } from 'react';
import { Button } from 'react-native';
import {
  MapView,
  Camera,
  RasterDemSource,
  HillshadeLayer,
} from '@rnmapbox/maps';

const HillshadeSource = () => {
  const [showHillshade, setShowHillshade] = useState(true);

  return (
    <>
      <Button
        title={showHillshade ? 'Hide Hillshade' : 'Show Hillshade'}
        onPress={() => setShowHillshade((v) => !v)}
      />
      <MapView style={{ flex: 1 }}>
        <Camera
          defaultSettings={{
            centerCoordinate: [-112.114, 36.0544],
            zoomLevel: 12.5,
          }}
        />
        {showHillshade ? (
          <RasterDemSource
            id="mapbox-dem"
            url="mapbox://mapbox.mapbox-terrain-dem-v1"
            maxZoomLevel={14}
          >
            <HillshadeLayer
              id="hillshade-layer"
              slot="bottom"
              style={{
                hillshadeExaggeration: 1,
                hillshadeIlluminationDirection: 335,
                hillshadeShadowColor: '#473B24',
                hillshadeHighlightColor: '#FDFCFA',
                hillshadeAccentColor: '#5A4E3B',
              }}
            />
          </RasterDemSource>
        ) : null}
      </MapView>
    </>
  );
};

export default HillshadeSource;

/* end-example-doc */

/** @type ExampleWithMetadata['metadata'] */
const metadata = {
  title: 'Hillshade Layer',
  tags: ['RasterDemSource', 'HillshadeLayer'],
  docs: 'Renders terrain hillshading from a raster-dem source.',
};
HillshadeSource.metadata = metadata;
