import React from 'react';
import PropTypes from 'prop-types';
import { requireNativeComponent } from 'react-native';
import { isFunction, runNativeCommand } from '../utils';

const DEFAULT_CENTER_COORDINATE = {
  type: 'Point',
  coordinates: [-77.036086, 38.910233],
};

export const NATIVE_MODULE_NAME = 'RCTMGLMapView';

const RCTMGLMapView = requireNativeComponent(NATIVE_MODULE_NAME, MapView, {
  nativeOnly: { onMapChange: true }
});

/**
 * MapView backed by Mapbox Native GL
 */
class MapView extends React.Component {
  static StyleURL = {
    Street: 'mapbox-streets',
    Dark: 'mapbox-dark',
    Light: 'mapbox-light',
    Outdoors: 'mapbox-outdoors',
    Satellite: 'mapbox-satellite',
  };

  static EventTypes = {
    Press: 'press',
    LongPress: 'longpress',
    RegionWillChange: 'regionwillchange',
    RegionIsChanging: 'regionischanging',
    RegionDidChange: 'regiondidchange',
    WillStartLoadinMap: 'willstartloadingmap',
    DidFinishLoadingMap: 'didfinishloadingmap',
    DidFailLoadingMap: 'didfailoadingmap',
    WillStartRenderingFrame: 'willstartrenderingframe',
    DidFinishRenderingFrame: 'didfinishrenderingframe',
    DidFinishRenderingFrameFully: 'didfinishrenderingframefully',
    WillStartRenderingMap: 'willstartrenderingmap',
    DidFinishRenderingMap: 'didfinishrenderingmap',
    DidFinishRenderingMapFully: 'didfinishrenderingmapfully',
    DidFinishLoadingStyle: 'didfinishloadingstyle',
  };

  static propTypes = {
    /**
     * Animates changes between pitch and bearing
     */
    animated: PropTypes.bool,

    /**
     * Initial center coordinate on map
     */
    centerCoordinate: PropTypes.object,

    /**
     * Initial heading on map
     */
    heading: PropTypes.number,

    /**
     * Initial pitch on map
     */
    pitch: PropTypes.number,

    /**
     * Style for wrapping React Native View
     */
    style: PropTypes.any,

    /**
     * Style URL for map
     */
    styleURL: PropTypes.string,

    /**
     * Initial zoom level of map
     */
    zoomLevel: PropTypes.number,

    /**
     * Min zoom level of map
     */
    minZoomLevel: PropTypes.number,

    /**
     * Max zoom level of map
     */
    maxZoomLevel: PropTypes.number,

    /**
     * Enable/Disable scroll on the map
     */
    scrollEnabled: PropTypes.bool,

    /**
     * Enable/Disable pitch on map
     */
    pitchEnabled: PropTypes.bool,

    /**
     * Map press listener, gets called when a user presses the map
     */
     onPress: PropTypes.func,

     /**
      * Map long press listener, gets called when a user long presses the map
      */
     onLongPress: PropTypes.func,

     /**
      * This event is triggered whenever the currently displayed map region is about to change.
      */
     onRegionWillChange: PropTypes.func,

     /**
      * This event is triggered whenever the currently displayed map region is changing.
      */
     onRegionIsChanging: PropTypes.func,

     /**
      * This event is triggered whenever the currently displayed map region finished changing
      */
     onRegionDidChange: PropTypes.func,

     /**
      * This event is triggered when the map is about to start loading a new map style.
      */
     onWillStartLoadingMap: PropTypes.func,

     /**
      * This is triggered when the map has successfully loaded a new map style.
      */
     onDidFinishLoadingMap: PropTypes.func,

     /**
      * This event is triggered when the map has failed to load a new map style.
      */
     onDidFailLoadingMap: PropTypes.func,

     /**
      * This event is triggered when the map will start rendering a frame.
      */
     onWillStartRenderingFrame: PropTypes.func,

     /**
      * This event is triggered when the map finished rendering a frame.
      */
     onDidFinishRenderingFrame: PropTypes.func,

     /**
      * This event is triggered when the map fully finished rendering a frame.
      */
     onDidFinishRenderingFrameFully: PropTypes.func,

     /**
      * This event is triggered when the map will start rendering the map.
      */
     onWillStartRenderingMap: PropTypes.func,

     /**
      * This event is triggered when the map finished rendering the map.
      */
     onDidFinishRenderingMap: PropTypes.func,

     /**
      * This event is triggered when the map fully finished rendering the map.
      */
     onDidFinishRenderingMapFully: PropTypes.func,

     /**
      * This event is triggered when a style has finished loading.
      */
     onDidFinishLoadingStyle: PropTypes.func,
  };

  static defaultProps = {
    animated: true,
    centerCoordinate: DEFAULT_CENTER_COORDINATE,
    heading: 0,
    pitch: 0,
    scrollEnabled: true,
    pitchEnabled: true,
    zoomLevel: 16,
    styleURL: MapView.StyleURL.Street,
  };

  constructor (props) {
    super(props);

    this._onPress = this._onPress.bind(this);
    this._onLongPress = this._onLongPress.bind(this);
    this._onChange = this._onChange.bind(this);
  }

  flyTo (coordinates, duration = 2000) {
    if (!this._nativeRef) {
      return;
    }
    runNativeCommand(NATIVE_MODULE_NAME, 'flyTo', this._nativeRef, [
      { type: 'Point', coordinates: coordinates },
      duration,
    ]);
  }

  _onPress (e) {
    if (isFunction(this.props.onPress)) {
      this.props.onPress(e.nativeEvent.payload);
    }
  }

  _onLongPress (e) {
    if (isFunction(this.props.onLongPress)) {
      this.props.onLongPress(e.nativeEvent.payload);
    }
  }

  _onChange (e) {
    const { type, payload } = e.nativeEvent;
    let propName = '';

    switch (type) {
      case MapView.EventTypes.RegionWillChange:
        propName = 'onRegionWillChange';
        break;
      case MapView.EventTypes.RegionIsChanging:
        propName = 'onRegionIsChanging';
        break;
      case MapView.EventTypes.RegionDidChange:
        propName = 'onRegionDidChange';
        break;
      case MapView.EventTypes.WillStartLoadinMap:
        propName = 'onWillStartLoadingMap';
        break;
      case MapView.EventTypes.DidFinishLoadingMap:
        propName = 'onDidFinishLoadingMap';
        break;
      case MapView.EventTypes.DidFailLoadingMap:
        propName = 'onDidFailLoadingMap';
        break;
      case MapView.EventTypes.WillStartRenderingFrame:
        propName = 'onWillStartRenderingFrame';
        break;
      case MapView.EventTypes.DidFinishRenderingFrame:
        propName = 'onDidFinishRenderingFrame';
        break;
      case MapView.EventTypes.DidFinishRenderingFrameFully:
        propName = 'onDidFinishRenderingFrameFully';
        break;
      case MapView.EventTypes.WillStartRenderingMap:
        propName = 'onWillStartRenderingMap';
        break;
      case MapView.EventTypes.DidFinishRenderingMap:
        propName = 'onDidFinishRenderingMap';
        break;
      case MapView.EventTypes.DidFinishRenderingMapFully:
        propName = 'onDidFinishRenderingMapFully';
        break;
      case MapView.EventTypes.DidFinishLoadingStyle:
        propName = 'onDidFinishLoadingStyle';
        break;
    }

    if (propName.length) {
      this._handleOnChange(propName, payload);
    }
  }

  _handleOnChange(propName, payload) {
    if (isFunction(this.props[propName])) {
      this.props[propName](payload);
    }
  }

  render () {
    const props = {
      animated: this.props.animated,
      centerCoordinate: this.props.centerCoordinate,
      heading: this.props.heading,
      pitch: this.props.pitch,
      style: this.props.style,
      styleURL: this.props.styleURL,
      zoomLevel: this.props.zoomLevel,
      minZoomLevel: this.props.minZoomLevel,
      maxZoomLevel: this.props.maxZoomLevel,
      scrollEnabled: this.props.scrollEnabled,
      pitchEnabled: this.props.pitchEnabled,
    };

    const callbacks = {
      onPress: this._onPress,
      onLongPress: this._onLongPress,
      onMapChange: this._onChange,
    };

    return (
      <RCTMGLMapView
        {...props}
        {...callbacks}
        ref={(nativeRef) => this._nativeRef = nativeRef} />
    );
  }
}

export default MapView;
