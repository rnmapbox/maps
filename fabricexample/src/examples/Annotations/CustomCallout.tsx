import MapboxGL, {type SymbolLayerStyle} from '@rnmapbox/maps';
import {Feature} from '@turf/helpers';
import React, {useState} from 'react';
import {StyleProp, Text, TextStyle, View, ViewStyle} from 'react-native';

import exampleIcon from '../../assets/pin.png';
import sheet from '../../styles/sheet';
import Page from '../common/Page';
import {BaseExampleProps} from '../common/BaseExamplePropTypes';

const defaultCamera = {
  centerCoordinate: [12.338, 45.4385],
  zoomLevel: 17.4,
};

const featureCollection: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: '9d10456e-bdda-4aa9-9269-04c1667d4552',
      properties: {
        icon: 'example',
        message: 'Hello!',
      },
      geometry: {
        type: 'Point',
        coordinates: [12.338, 45.4385],
      },
    },
  ],
};

type CustomCalloutViewProps = {
  message: string;
};

const CustomCalloutView = ({message}: CustomCalloutViewProps) => {
  return (
    <View style={styles.calloutContainerStyle}>
      <Text style={styles.customCalloutText}>{message}</Text>
    </View>
  );
};

const CustomCallout = (props: BaseExampleProps) => {
  const [selectedFeature, setSelectedFeature] =
    useState<Feature<{type: string; coordinates: number[]}, any>>();

  const onPinPress = (e: any): void => {
    if (selectedFeature) {
      setSelectedFeature(undefined);
      return;
    }

    const feature = e?.features[0];
    setSelectedFeature(feature);
  };

  return (
    <Page {...props}>
      <MapboxGL.MapView style={sheet.matchParent}>
        <MapboxGL.Camera defaultSettings={defaultCamera} />
        <MapboxGL.ShapeSource
          id="mapPinsSource"
          shape={featureCollection}
          onPress={onPinPress}>
          <MapboxGL.SymbolLayer id="mapPinsLayer" style={styles.mapPinLayer} />
        </MapboxGL.ShapeSource>
        {selectedFeature && (
          <MapboxGL.MarkerView
            coordinate={selectedFeature.geometry.coordinates}>
            <CustomCalloutView message={selectedFeature?.properties?.message} />
          </MapboxGL.MarkerView>
        )}
      </MapboxGL.MapView>
    </Page>
  );
};

interface CustomCalloutStyles {
  mapPinLayer: SymbolLayerStyle;
  customCalloutText: StyleProp<TextStyle>;
  calloutContainerStyle: StyleProp<ViewStyle>;
}

const styles: CustomCalloutStyles = {
  mapPinLayer: {
    iconAllowOverlap: true,
    iconAnchor: 'bottom',
    iconSize: 1.0,
    iconImage: exampleIcon,
  },
  customCalloutText: {
    color: 'black',
    fontSize: 16,
  },
  calloutContainerStyle: {
    backgroundColor: 'white',
    width: 60,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export default CustomCallout;
