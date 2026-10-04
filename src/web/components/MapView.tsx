import React, { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import mapboxgl from 'mapbox-gl';

import MapContext from '../MapContext';

const defaultStyleURL = 'mapbox://styles/mapbox/streets-v11';

type Props = {
  style?: StyleProp<ViewStyle>;
  styleURL?: string;
  styleJSON?: string;
  children?: ReactNode;
};

const reloadWholeStyle = { diff: false } as Parameters<
  mapboxgl.Map['setStyle']
>[1];

function styleFromProps({ styleURL, styleJSON }: Props) {
  if (styleURL) {
    return styleURL;
  }
  if (styleJSON) {
    return JSON.parse(styleJSON) as mapboxgl.StyleSpecification;
  }
  return defaultStyleURL;
}

class MapView extends React.Component<
  Props,
  { map?: mapboxgl.Map; styleGeneration: number }
> {
  state: { map?: mapboxgl.Map; styleGeneration: number } = {
    map: undefined,
    styleGeneration: 0,
  };
  mapContainer: HTMLElement | null = null;
  map: mapboxgl.Map | null = null;

  componentDidMount() {
    if (!this.mapContainer) {
      console.error('MapView - mapContainer is null');
      return;
    }
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: styleFromProps(this.props),
    });
    this.map = map;
    this.setState({ map });
    map.on('style.load', () => {
      this.setState(({ styleGeneration }) => ({
        styleGeneration: styleGeneration + 1,
      }));
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this.map &&
      (prevProps.styleURL !== this.props.styleURL ||
        prevProps.styleJSON !== this.props.styleJSON)
    ) {
      this.map.setStyle(styleFromProps(this.props), reloadWholeStyle);
    }
  }

  componentWillUnmount() {
    this.map?.remove();
    this.map = null;
  }

  render() {
    const { children, style } = this.props;
    const { map, styleGeneration } = this.state;
    return (
      <View style={[{ flex: 1 }, style]}>
        <div
          style={{ position: 'absolute', inset: 0 }}
          ref={(el) => {
            this.mapContainer = el;
          }}
        />
        {map && (
          <MapContext.Provider value={{ map, styleGeneration }}>
            {children}
          </MapContext.Provider>
        )}
      </View>
    );
  }
}

export default MapView;
