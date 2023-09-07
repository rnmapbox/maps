import React, {useRef, memo, useState} from 'react';
import {Text} from 'react-native';
import MapboxGL, {
  MapView,
  Camera,
  ShapeSource,
  SymbolLayer,
  Images,
} from '@rnmapbox/maps';
import {featureCollection, feature} from '@turf/helpers';

import sheet from '../../styles/sheet';
import exampleIcon from '../../assets/example.png';
import Page from '../common/Page';
import Bubble from '../common/Bubble';
import {BaseExampleProps} from '../common/BaseExamplePropTypes';

const styles = {
  icon: {
    iconImage: 'icon',
    iconAllowOverlap: true,
  },
};

const CustomIcon = memo((props: BaseExampleProps) => {
  const cameraRef = useRef<Camera>(null);
  const [stateFeatureCollection, setStateFeatureCollection] =
    useState<GeoJSON.FeatureCollection>(featureCollection([]));

  const onPress = (e: GeoJSON.Feature) => {
    const aFeature = feature(e.geometry);
    aFeature.id = `${Date.now()}`;

    setStateFeatureCollection(
      featureCollection([...stateFeatureCollection.features, aFeature]),
    );
  };

  const onSourceLayerPress = (e: any) => {
    console.log(
      'You pressed a layer here are your features:',
      e.features,
      e.coordinates,
      e.point,
    );
  };

  return (
    <Page {...props}>
      <MapView
        style={sheet.matchParent}
        styleURL={MapboxGL.StyleURL.Light}
        onPress={onPress}>
        <Camera
          ref={cameraRef}
          zoomLevel={9}
          centerCoordinate={[-73.970895, 40.723279]}
        />
        <ShapeSource
          id="symbolLocationSource"
          hitbox={{width: 20, height: 20}}
          onPress={e => onSourceLayerPress(e)}
          shape={stateFeatureCollection}>
          <SymbolLayer
            id="symbolLocationSymbols"
            minZoomLevel={1}
            style={styles.icon}
          />
          <Images images={{icon: exampleIcon}} />
        </ShapeSource>
      </MapView>
      <Bubble>
        <Text>Tap on Map to add an icon</Text>
      </Bubble>
    </Page>
  );
});

export default CustomIcon;
