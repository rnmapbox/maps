import geoViewport from '@mapbox/geo-viewport';
import Mapbox, {
  Camera,
  MapView,
  offlineManagerLegacy,
  StyleURL,
} from '@rnmapbox/maps';
import React, { useRef, useState } from 'react';
import { Button, Dimensions, TextInput } from 'react-native';

import { ExampleWithMetadata } from '../common/ExampleMetadata'; // exclude-from-doc

const CENTER_COORD: [number, number] = [-73.970895, 40.723279];
const MAPBOX_VECTOR_TILE_SIZE = 512;
console.log('=> Mapbox[0]:', Mapbox);
console.log('=> Mapbox.StyleURL[1]:', Mapbox.StyleURL);
console.log('=> StyleURL[2]:', StyleURL);
const STYLE_URL = Mapbox.StyleURL.Satellite;

const OfflineLegacyExample = () => {
  const [packName, setPackName] = useState('pack-1');
  const [showEditTitle, setShowEditTitle] = useState(false);
  const [tileLimit, setTileLimit] = useState(6000);
  const [timeout, setTimeout] = useState(60);

  const map = useRef();

  return (
    <>
      <Button
        title={`Pack name: ${packName}`}
        onPress={() => {
          setShowEditTitle(!showEditTitle);
        }}
      />
      {showEditTitle && (
        <TextInput
          value={packName}
          autoFocus={true}
          onChangeText={(text) => setPackName(text)}
          onBlur={() => setShowEditTitle(false)}
        />
      )}
      <Button
        title={`Toggle tile limit (${tileLimit})`}
        onPress={() => {
          setTileLimit(tileLimit === 6000 ? 10 : 6000);
          offlineManagerLegacy.setTileCountLimit(
            tileLimit === 6000 ? 10 : 6000,
          );
        }}
      />
      <Button
        title={`Toggle timeout (${timeout})`}
        onPress={() => {
          setTimeout(timeout === 60 ? 10 : 60);
          offlineManagerLegacy.setTimeout(timeout === 60 ? 10 : 60);
        }}
      />
      <Button
        title="Get all packs"
        onPress={async () => {
          const packs = await offlineManagerLegacy.getPacks();
          console.log('=> packs:', packs);
          packs.forEach((pack) => {
            console.log(
              'pack:',
              pack,
              'name:',
              pack.name,
              'bounds:',
              pack?.bounds,
              'metadata',
              pack?.metadata,
            );
          });
        }}
      />
      <Button
        title="Get pack"
        onPress={async () => {
          const pack = await offlineManagerLegacy.getPack(packName);
          if (pack) {
            console.log(
              'pack:',
              pack,
              'name:',
              pack.name,
              'bounds:',
              pack?.bounds,
              'metadata',
              pack?.metadata,
            );

            console.log('=> status', await pack?.status());
          }
        }}
      />
      <Button
        title="Pause pack"
        onPress={async () => {
          const pack = await offlineManagerLegacy.getPack(packName);
          if (pack) {
            await pack.pause();
          }
        }}
      />
      <Button
        title="Resume pack"
        onPress={async () => {
          const pack = await offlineManagerLegacy.getPack(packName);
          if (pack) {
            await pack.resume();
          }
        }}
      />
      <Button
        title="Remove packs"
        onPress={async () => {
          const result = await offlineManagerLegacy.resetDatabase();
          console.log('Reset DB done:', result);
        }}
      />
      <Button
        title="Create Pack"
        onPress={async () => {
          if (map.current) {
            const { width, height } = Dimensions.get('window');
            const mapCenter = await map.current.getCenter();

            const bounds: [number, number, number, number] = geoViewport.bounds(
              mapCenter,
              13,
              [width, height],
              MAPBOX_VECTOR_TILE_SIZE,
            );

            const options = {
              name: packName,
              styleURL: STYLE_URL,
              bounds: [
                [bounds[0], bounds[1]],
                [bounds[2], bounds[3]],
              ] as [[number, number], [number, number]],
              minZoom: 9,
              maxZoom: 18,
              metadata: {
                whatIsThat: 'foo',
              },
            };

            const pack = await offlineManagerLegacy.createPack(
              options,
              (region, status) =>
                console.log('=> progress callback region:', 'status: ', status),
              (region, error) =>
                console.error('=> error callback region:', 'error:', error),
            );

            console.log('Create pack', pack);
          }
        }}
      />
      <MapView ref={map} style={{ flex: 1 }} styleURL={STYLE_URL}>
        <Camera zoomLevel={10} centerCoordinate={CENTER_COORD} />
      </MapView>
    </>
  );
};

export default OfflineLegacyExample;

/* end-example-doc */

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Offline Legacy Example',
  tags: [
    'offlineManagerLegacy#createPack',
    'offlineManagerLegacy#getPack',
    'offlineManagerLegacy#getPacks',
  ],
  docs: `
Demonstates basic use of offlineManagerLegacy api.
`,
};
OfflineLegacyExample.metadata = metadata;
