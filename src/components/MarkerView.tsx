import React, { useRef, useState } from 'react';
import {
  NativeModules,
  PixelRatio,
  Platform,
  type NativeSyntheticEvent,
  type ViewProps,
} from 'react-native';

import RNMBXMakerViewContentComponent from '../specs/RNMBXMarkerViewContentNativeComponent';
import NativeMarkerViewComponent from '../specs/RNMBXMarkerViewNativeComponent';
import { type Position } from '../types/Position';

import PointAnnotation from './PointAnnotation';

const Mapbox = NativeModules.RNMBXModule;

let _nextMarkerViewId = 0;

type Props = ViewProps & {
  /**
   * The center point (specified as a map coordinate) of the marker.
   */
  coordinate: Position;

  /**
   * Any coordinate between (0, 0) and (1, 1), where (0, 0) is the top-left corner of
   * the view, and (1, 1) is the bottom-right corner. Defaults to the center at (0.5, 0.5).
   */
  anchor: {
    x: number;
    y: number;
  };

  /**
   * Whether or not nearby markers on the map should all be displayed. If false, adjacent
   * markers will 'collapse' and only one will be shown. Defaults to false.
   */
  allowOverlap: boolean;

  /**
   * Whether or not nearby markers on the map should be hidden if close to a
   * UserLocation puck. Defaults to false.
   */
  allowOverlapWithPuck: boolean;

  isSelected: boolean;

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
  anchor = { x: 0.5, y: 0.5 },
  allowOverlap = false,
  allowOverlapWithPuck = false,
  isSelected = false,
  coordinate,
  style,
  children,
}: Props) => {
  // Stable ID for the legacy pre-v10 iOS PointAnnotation fallback below.
  const compatIdRef = useRef(`MV-${++_nextMarkerViewId}`);

  // Android new-arch (Fabric) fix: UIManager.measure reads from the Fabric shadow
  // tree, which doesn't include Mapbox's native setTranslationX/Y positioning.
  // Strategy: intercept setTranslationX/Y on the native side (see
  // RNMBXMarkerViewContent.kt), relay the values as an onAnnotationPosition event,
  // then apply them as a React `transform` on RNMBXMarkerView so the shadow tree
  // reflects the actual on-screen position. This makes
  // Pressability._responderRegion correct and onPress / touch feedback work.
  //
  // Key details:
  //  • position:'absolute' on RNMBXMarkerView → all markers have Yoga pos (0,0)
  //    in MapView, so the only shadow-tree offset is the transform itself.
  //  • Transform goes on RNMBXMarkerView (not RNMBXMarkerViewContent) so Fabric
  //    never fights Mapbox's native positioning.
  //  • Divide by PixelRatio: Android translationX/Y is in device pixels; React
  //    transform expects logical pixels (points).
  //
  // useState is called unconditionally (hooks rules) before the MapboxV10 early-return.
  const [annotationTranslate, setAnnotationTranslate] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Legacy pre-v10 iOS fallback — MapboxV10 is always truthy on current SDK
  // versions so this branch is dead code; it will be removed in a follow-up.
  if (Platform.OS === 'ios' && !Mapbox.MapboxV10) {
    return <PointAnnotation id={compatIdRef.current} {...({} as any)} />;
  }

  if (anchor.x < 0 || anchor.y < 0 || anchor.x > 1 || anchor.y > 1) {
    console.warn(
      `[MarkerView] Anchor with value (${anchor.x}, ${anchor.y}) should not be outside the range [(0, 0), (1, 1)]`,
    );
  }

  return (
    <RNMBXMarkerView
      style={[
        { position: 'absolute' },
        style,
        annotationTranslate != null
          ? {
              transform: [
                { translateX: annotationTranslate.x },
                { translateY: annotationTranslate.y },
              ],
            }
          : undefined,
      ]}
      coordinate={[Number(coordinate[0]), Number(coordinate[1])]}
      anchor={anchor}
      allowOverlap={allowOverlap}
      allowOverlapWithPuck={allowOverlapWithPuck}
      isSelected={isSelected}
      onTouchEnd={(e) => {
        e.stopPropagation();
      }}
    >
      <RNMBXMakerViewContentComponent
        collapsable={false}
        style={{ flex: 0, alignSelf: 'flex-start' }}
        onAnnotationPosition={(
          e: NativeSyntheticEvent<{ x: number; y: number }>,
        ) => {
          // translationX/Y from Android View are in device pixels; React
          // transform expects logical pixels (points). Divide by PixelRatio.
          const pr = PixelRatio.get();
          setAnnotationTranslate({
            x: e.nativeEvent.x / pr,
            y: e.nativeEvent.y / pr,
          });
        }}
      >
        {children}
      </RNMBXMakerViewContentComponent>
    </RNMBXMarkerView>
  );
};

const RNMBXMarkerView = NativeMarkerViewComponent;

export default MarkerView;
