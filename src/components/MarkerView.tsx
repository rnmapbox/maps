import React, { useCallback, useMemo } from 'react';
import { StyleSheet, type ViewProps } from 'react-native';

import RNMBXMakerViewContentComponent from '../specs/RNMBXMarkerViewContentNativeComponent';
import NativeMarkerViewComponent from '../specs/RNMBXMarkerViewNativeComponent';
import { type Position } from '../types/Position';

const DEFAULT_ANCHOR = { x: 0.5, y: 0.5 };

type Props = ViewProps & {
  /**
   * The center point (specified as a map coordinate) of the marker.
   */
  coordinate: Position;

  /**
   * Any coordinate between (0, 0) and (1, 1), where (0, 0) is the top-left corner of
   * the view, and (1, 1) is the bottom-right corner. Defaults to the center at (0.5, 0.5).
   */
  anchor?: {
    x: number;
    y: number;
  };

  /**
   * Whether or not nearby markers on the map should all be displayed. If false, adjacent
   * markers will 'collapse' and only one will be shown. Defaults to false.
   */
  allowOverlap?: boolean;

  /**
   * Whether or not nearby markers on the map should be hidden if close to a
   * UserLocation puck. Defaults to false.
   */
  allowOverlapWithPuck?: boolean;

  isSelected?: boolean;

  /**
   * Keep pan/pinch/drag gestures that start on this marker inside the marker instead of
   * letting them reach the map. Enable this for markers whose children handle their own
   * drags in JavaScript (e.g. a PanResponder-based slider), which otherwise race the map's
   * pan/zoom recogniser and can be taken over by the map. By default the marker is smart:
   * taps and native scrollables are kept, but a pan/pinch that merely starts on the marker
   * moves the map. Defaults to false.
   *
   * @platform android — on iOS the map's gesture recognisers already coexist with marker
   * content, so this has no effect.
   */
  stopGesturePropagation?: boolean;

  /**
   * One or more valid React Native views. You can use Pressable, TouchableOpacity,
   * etc. directly as children — onPress and touch feedback work correctly.
   */
  children: React.ReactElement;
};

/**
 * MarkerView represents an interactive React Native marker on the map.
 *
 * If you have static views, consider using PointAnnotation or SymbolLayer to display
 * an image, as they'll offer much better performance. Mapbox suggests using this
 * component for a maximum of around 100 views displayed at one time.
 *
 * This is implemented with view annotations on [Android](https://docs.mapbox.com/android/maps/guides/annotations/view-annotations/)
 * and [iOS](https://docs.mapbox.com/ios/maps/guides/annotations/view-annotations).
 *
 * This component has no dedicated `onPress` method. Instead, handle gestures
 * with the React views passed in as `children` — Pressable, TouchableOpacity,
 * etc. all work including their visual feedback (opacity, scale, etc.).
 */
const MarkerView = ({
  anchor = DEFAULT_ANCHOR,
  allowOverlap = false,
  allowOverlapWithPuck = false,
  isSelected = false,
  coordinate,
  style,
  pointerEvents,
  stopGesturePropagation = false,
  children,
}: Props) => {
  const handleTouchEnd = useCallback(
    (e: { stopPropagation: () => void }) => {
      if (pointerEvents !== 'none' && pointerEvents !== 'box-none') {
        e.stopPropagation();
      }
    },
    [pointerEvents],
  );

  if (anchor.x < 0 || anchor.y < 0 || anchor.x > 1 || anchor.y > 1) {
    console.warn(
      `[MarkerView] Anchor with value (${anchor.x}, ${anchor.y}) should not be outside the range [(0, 0), (1, 1)]`,
    );
  }

  const nativeCoordinate = useMemo(
    () => [Number(coordinate[0]), Number(coordinate[1])] as [number, number],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [coordinate[0], coordinate[1]],
  );

  const nativeStyle = useMemo(() => [styles.absolutePosition, style], [style]);

  return (
    <RNMBXMarkerView
      style={nativeStyle}
      coordinate={nativeCoordinate}
      anchor={anchor}
      allowOverlap={allowOverlap}
      allowOverlapWithPuck={allowOverlapWithPuck}
      isSelected={isSelected}
      pointerEvents={pointerEvents}
      stopGesturePropagation={stopGesturePropagation}
      onTouchEnd={handleTouchEnd}
    >
      <RNMBXMakerViewContentComponent
        collapsable={false}
        style={styles.contentContainer}
      >
        {children}
      </RNMBXMakerViewContentComponent>
    </RNMBXMarkerView>
  );
};

const RNMBXMarkerView = NativeMarkerViewComponent;

const styles = StyleSheet.create({
  absolutePosition: { position: 'absolute' },
  contentContainer: { flex: 0, alignSelf: 'flex-start' },
});

export default MarkerView;
