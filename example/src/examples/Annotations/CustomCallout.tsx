import React, {FC, useState, useEffect} from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';

import exampleIcon from '../../assets/pin.png';
import sheet from '../../styles/sheet';
import Page from '../common/Page';
import { Feature } from '@turf/helpers';
import { View, Text, ViewStyle } from 'react-native';

const defaultCamera = {
  centerCoordinate: [12.338, 45.4385],
  zoomLevel: 17.4,
};

const featureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: '9d10456e-bdda-4aa9-9269-04c1667d4552',
      properties: {
        icon: 'example',
        message: 'Hello!'
      },
      geometry: {
        type: 'Point',
        coordinates: [12.338, 45.4385],
      },
    }
  ]
};

type CustomCalloutViewProps = {
  message: String
};

const calloutContainerStyle:ViewStyle = {
  backgroundColor: 'white',
  width: 60,
  height: 40,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const CustomCalloutView: FC<CustomCalloutViewProps> = ({ message }) => {
  return <View style={calloutContainerStyle}>
    <Text style={{ color: 'black', fontSize: 16 }}>
      {message}
    </Text>
  </View>;
}

const CustomCallout: FC<any> = (props) => {
  const [selectedFeature, setSelectedFeature] = useState<Feature<{ type: string; coordinates: number[]; }, any>>();
  const onPinPress = (e:any)=>{
    if (e?.features?.length > 0) {
      const feature = e?.features[0];
      setSelectedFeature(feature);
    }
  };

  return (
    <Page
      {...props}>
      <MapboxGL.MapView style={sheet.matchParent}>
        <MapboxGL.Camera defaultSettings={defaultCamera} />
        <MapboxGL.ShapeSource
                    id='mapPinsSource'
                    shape={featureCollection}
                    onPress={onPinPress}
                >
                    <MapboxGL.SymbolLayer
                        id='mapPinsLayer'
                        style={{ iconAllowOverlap: true,
                            iconAnchor: 'bottom',
                            iconSize: 1.0,
                            iconImage: exampleIcon
                        }}
                    />
                </MapboxGL.ShapeSource>
                {selectedFeature && <MapboxGL.MarkerView id='selectedFeatureMarkerView'
                    coordinate={selectedFeature.geometry.coordinates}>
                    <CustomCalloutView
                        message={selectedFeature?.properties?.message}
                    />
                </MapboxGL.MarkerView>}
      </MapboxGL.MapView>
    </Page>
  );
};

export default CustomCallout;
