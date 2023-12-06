import Mapbox, { type SymbolLayerStyle } from '@rnmapbox/maps';
import { Feature } from '@turf/helpers';
import React, { useState } from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';

import exampleIcon from '../../assets/pin.png';
import sheet from '../../styles/sheet';
import { ExampleWithMetadata } from '../common/ExampleMetadata'; // exclude-from-doc

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

const CustomCalloutView = ({ message }: CustomCalloutViewProps) => {
  return (
    <View style={styles.calloutContainerStyle}>
      <Text style={styles.customCalloutText}>{message}</Text>
    </View>
  );
};

const CustomCallout = () => {
  const [selectedFeature, setSelectedFeature] =
    useState<GeoJSON.Feature<GeoJSON.Point>>();

  const onPinPress = (e: { features: Array<GeoJSON.Feature> }): void => {
    if (selectedFeature) {
      setSelectedFeature(undefined);
      return;
    }

    const feature = e?.features[0] as Feature<GeoJSON.Point>;
    setSelectedFeature(feature);
  };

  return (
    <Mapbox.MapView style={sheet.matchParent}>
      <Mapbox.Camera defaultSettings={defaultCamera} />
      <Mapbox.Images images={{ exampleIcon }} />
      <Mapbox.ShapeSource
        id="mapPinsSource"
        shape={featureCollection}
        onPress={onPinPress}
      >
        <Mapbox.SymbolLayer id="mapPinsLayer" style={styles.mapPinLayer} />
      </Mapbox.ShapeSource>
      {selectedFeature && (
        <Mapbox.MarkerView coordinate={selectedFeature.geometry.coordinates}>
          <CustomCalloutView message={selectedFeature?.properties?.message} />
        </Mapbox.MarkerView>
      )}
    </Mapbox.MapView>
  );
};

const styles: {
  matchParent: StyleProp<ViewStyle>;
  mapPinLayer: SymbolLayerStyle;
  customCalloutText: StyleProp<TextStyle>;
  calloutContainerStyle: StyleProp<ViewStyle>;
} = {
  matchParent: {
    flex: 1,
  },
  mapPinLayer: {
    iconAllowOverlap: true,
    iconAnchor: 'bottom',
    iconSize: 1.0,
    iconImage: 'exampleIcon',
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

/* end-example-doc */

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Custom Callout',
  tags: ['MarkerView'],
  docs: `
Use MarkerView to create a custom callout.
`,
};
CustomCallout.metadata = metadata;
