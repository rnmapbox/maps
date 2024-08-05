import { Component, ContextType } from 'react';

import { CameraProps, CameraStop, CameraRef } from '../../components/Camera';
import { Position } from '../../types/Position';
import MapContext from '../MapContext';

function isArray<T>(value: T | ArrayLike<T>): value is ArrayLike<T> {
  return (value as ArrayLike<T>).length !== undefined;
}

function buildMapboxGlPadding(
  padding?: number | number[],
): number | mapboxgl.PaddingOptions | undefined {
  if (padding === undefined) {
    // undefined
    return undefined;
  } else if (!isArray(padding)) {
    // padding
    return padding;
  } else {
    // Array
    if (padding.length === 0) {
      // []
      return undefined;
    } else if (padding.length < 2) {
      // [padding]
      return padding[0];
    } else if (padding.length < 4) {
      // [vertical, horizontal]
      return {
        left: padding[0],
        right: padding[0],
        top: padding[1],
        bottom: padding[1],
      };
    } else {
      // [top, right, bottom, left]
      return {
        top: padding[0],
        right: padding[1],
        bottom: padding[2],
        left: padding[3],
      };
    }
  }
}

class Camera
  extends Component<
    Pick<
      CameraProps,
      'centerCoordinate' | 'zoomLevel' | 'minZoomLevel' | 'maxZoomLevel'
    >
  >
  implements Omit<CameraRef, 'setCamera'>
{
  context!: ContextType<typeof MapContext>;

  static contextType = MapContext;
  static UserTrackingModes = [];

  componentDidMount() {
    const { map } = this.context;
    if (!map) {
      return;
    }

    // minZoomLevel
    if (this.props.minZoomLevel !== undefined) {
      map.setMinZoom(this.props.minZoomLevel);
    }

    // maxZoomLevel
    if (this.props.maxZoomLevel !== undefined) {
      map.setMaxZoom(this.props.maxZoomLevel);
    }

    // zoomLevel
    if (this.props.zoomLevel !== undefined) {
      map.setZoom(this.props.zoomLevel);
    }

    // centerCoordinate
    if (this.props.centerCoordinate !== undefined) {
      map.flyTo({
        center: this.props.centerCoordinate.slice(0, 2) as [number, number],
        duration: 0,
      });
    }
  }

  fitBounds(
    northEastCoordinates: Position,
    southWestCoordinates: Position,
    padding: number | number[] = 0,
    animationDuration = 0,
  ) {
    const { map } = this.context;
    if (map) {
      map.fitBounds(
        [
          northEastCoordinates.slice(0, 2) as [number, number],
          southWestCoordinates.slice(0, 2) as [number, number],
        ],
        {
          padding: buildMapboxGlPadding(padding),
          duration: animationDuration,
        },
      );
    }
  }

  flyTo(centerCoordinate: Position, animationDuration = 2000) {
    const { map } = this.context;
    if (map) {
      map.flyTo({
        center: centerCoordinate.slice(0, 2) as [number, number],
        duration: animationDuration,
      });
    }
  }

  moveTo(centerCoordinate: Position, animationDuration = 0) {
    const { map } = this.context;
    if (map) {
      map.easeTo({
        center: centerCoordinate.slice(0, 2) as [number, number],
        duration: animationDuration,
      });
    }
  }

  zoomTo(zoomLevel: number, animationDuration = 2000) {
    const { map } = this.context;
    if (map) {
      map.flyTo({
        zoom: zoomLevel,
        duration: animationDuration,
      });
    }
  }

  setCamera(props: CameraStop) {
    const { map } = this.context;
    if (!map) {
      return;
    }
    const {
      centerCoordinate,
      bounds,
      zoomLevel,
      heading,
      pitch,
      padding,
      animationDuration = 2000,
    } = props;

    let options: mapboxgl.CameraOptions = {
      center: centerCoordinate?.slice(0, 2) as [number, number],
      zoom: zoomLevel ?? map.getZoom(),
      bearing: heading ?? map.getBearing(),
      pitch: pitch ?? map.getPitch(),
    };

    if (
      padding?.paddingTop &&
      padding?.paddingRight &&
      padding?.paddingBottom &&
      padding?.paddingLeft
    ) {
      options.padding = buildMapboxGlPadding([
        padding.paddingTop,
        padding.paddingRight,
        padding.paddingBottom,
        padding.paddingLeft,
      ]);
    }

    if (bounds?.ne && bounds?.sw) {
      const newCameraTransform = map.cameraForBounds(
        [bounds.ne as mapboxgl.LngLatLike, bounds.sw as mapboxgl.LngLatLike],
        options,
      );
      options = { ...options, ...newCameraTransform };
    }

    switch (props.animationMode) {
      default:
      case 'easeTo':
      case 'linearTo':
        map.easeTo({ ...options, duration: animationDuration });
        break;
      case 'flyTo':
        map.flyTo({ ...options, duration: animationDuration });
        break;
      case 'moveTo':
      case 'none':
        map.jumpTo(options);
        break;
    }
  }

  render() {
    return <></>;
  }
}

export { Camera };
export default Camera;
