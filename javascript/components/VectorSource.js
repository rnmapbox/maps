import React from 'react';
import PropTypes from 'prop-types';
import {NativeModules, requireNativeComponent} from 'react-native';

import {cloneReactChildrenWithProps, viewPropTypes, isFunction} from '../utils';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLVectorSource';

/**
 * VectorSource is a map content source that supplies tiled vector data in Mapbox Vector Tile format to be shown on the map.
 * The location of and metadata about the tiles are defined either by an option dictionary or by an external file that conforms to the TileJSON specification.
 */
class VectorSource extends React.Component {
  static propTypes = {
    ...viewPropTypes,

    /**
     * A string that uniquely identifies the source.
     */
    id: PropTypes.string,

    /**
     * A URL to a TileJSON configuration file describing the source’s contents and other metadata.
     */
    url: PropTypes.string,

    /**
     * Source press listener, gets called when a user presses one of the children layers only
     * if that layer has a higher z-index than another source layers
     */
    onPress: PropTypes.func,

    /**
     * Overrides the default touch hitbox(44x44 pixels) for the source layers
     */
    hitbox: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }),
  };

  static defaultProps = {
    id: MapboxGL.StyleSource.DefaultSourceID,
  };

  render() {
    const props = {
      id: this.props.id,
      url: this.props.url,
      hitbox: this.props.hitbox,
      hasPressListener: isFunction(this.props.onPress),
      onMapboxVectorSourcePress: this.props.onPress,
      onPress: undefined,
    };
    return (
      <RCTMGLVectorSource {...props}>
        {cloneReactChildrenWithProps(this.props.children, {
          sourceID: this.props.id,
        })}
      </RCTMGLVectorSource>
    );
  }
}

const RCTMGLVectorSource = requireNativeComponent(
  NATIVE_MODULE_NAME,
  VectorSource,
  {
    nativeOnly: {
      hasPressListener: true,
      onMapboxVectorSourcePress: true,
    },
  },
);

export default VectorSource;
