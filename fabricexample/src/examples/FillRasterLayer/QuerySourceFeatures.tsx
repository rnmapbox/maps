import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Text} from 'react-native';
import MapboxGL, {FillLayer, VectorSource} from '@rnmapbox/maps';

import {BaseExampleProps} from '../common/BaseExamplePropTypes';
import sheet from '../../styles/sheet';
import Page from '../common/Page';
import Bubble from '../common/Bubble';

const vectorSourceUnderTest = {
  url: 'mapbox://mapbox.82pkq93d',
  id: 'counties',
};
const zoomUnderTest = 15;
const coordinatesUnderTest = [-73.9880595, 40.7738941];
const countiesOfInterest = [
  'New York County', // In viewport
  'Hudson County', // Outside of viewport
];

const QuerySourceFeatures = (props: BaseExampleProps) => {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  const map = useRef<MapboxGL.MapView>(null);

  const runTest = useCallback(async () => {
    if (!map || !ready) return;
    try {
      const res = await map.current?.querySourceFeatures(
        vectorSourceUnderTest.id,
        ['any', ...countiesOfInterest.map(c => ['==', ['get', 'COUNTY'], c])],
        ['original'],
      );

      if (!res) {
        setMessage(`querySourceFeatures result is invalid`);
        return;
      }

      const featuresCount = res.features.length;
      if (featuresCount !== countiesOfInterest.length) {
        setMessage(
          `[ERROR] querySourceFeatures resulted in ${featuresCount} features. Expected ${countiesOfInterest.length}`,
        );
        return;
      }

      setMessage(
        `[SUCCESS] querySourceFeatures retrieved ${featuresCount} features ` +
          `and includes: \n- ${res.features
            .map(f => f.properties?.COUNTY)
            .join('\n- ')}`,
      );
    } catch (err) {
      console.error(err);
      setMessage(`[ERROR] ${err}. See console for details.`);
    }
  }, [ready]);

  useEffect(() => {
    runTest();
  }, [runTest]);

  return (
    <Page {...props}>
      <MapboxGL.MapView
        style={sheet.matchParent}
        styleURL={MapboxGL.StyleURL.Light}
        ref={map}
        onCameraChanged={runTest}
        onMapIdle={() => setReady(true)}>
        <VectorSource {...vectorSourceUnderTest}>
          <FillLayer
            sourceID={'counties'}
            sourceLayerID="original"
            id="counties"
            belowLayerID="building"
          />
        </VectorSource>
        <MapboxGL.Camera
          zoomLevel={zoomUnderTest}
          centerCoordinate={coordinatesUnderTest}
          animationMode="none"
          animationDuration={0}
        />
      </MapboxGL.MapView>

      <Bubble>
        <Text>{message}</Text>
      </Bubble>
    </Page>
  );
};

export default QuerySourceFeatures;
