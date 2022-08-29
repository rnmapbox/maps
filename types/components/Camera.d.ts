import React from 'react';
import { Position } from '@turf/helpers';
import { UserTrackingModeChangeCallback, UserTrackingMode } from '../types';
export declare const NATIVE_MODULE_NAME = "RCTMGLCamera";
export interface CameraRef {
    setCamera: (config: CameraStop | CameraStops) => void;
    fitBounds: (ne: Position, sw: Position, paddingConfig?: number | number[], animationDuration?: number) => void;
    flyTo: (centerCoordinate: Position, animationDuration?: number) => void;
    moveTo: (centerCoordinate: Position, animationDuration?: number) => void;
    zoomTo: (zoomLevel: number, animationDuration?: number) => void;
}
export declare type CameraStop = {
    /** Allows static check of the data type. For internal use only. */
    readonly type?: 'CameraStop';
    /** The location on which the map should center. */
    centerCoordinate?: Position;
    /** The corners of a box around which the map should bound. Contains padding props for backwards
     * compatibility; the root `padding` prop should be used instead. */
    bounds?: CameraBoundsWithPadding;
    /** The heading (orientation) of the map. */
    heading?: number;
    /** The pitch of the map. */
    pitch?: number;
    /** The zoom level of the map. */
    zoomLevel?: number;
    /** The viewport padding in points. */
    padding?: CameraPadding;
    /** The duration the map takes to animate to a new configuration. */
    animationDuration?: number;
    /** The easing or path the camera uses to animate to a new configuration. */
    animationMode?: CameraAnimationMode;
};
export declare type CameraFollowConfig = {
    /** The mode used to track the user location on the map. */
    followUserMode?: UserTrackingMode;
    /** Whether the map orientation follows the user location. */
    followUserLocation?: boolean;
    /** The zoom level used when following the user location. */
    followZoomLevel?: number;
    /** The pitch used when following the user location. */
    followPitch?: number;
    /** The heading used when following the user location. */
    followHeading?: number;
};
export declare type CameraMinMaxConfig = {
    /** The lowest allowed zoom level. */
    minZoomLevel?: number;
    /** The highest allowed zoom level. */
    maxZoomLevel?: number;
    /** The corners of a box defining the limits of where the camera can pan or zoom. */
    maxBounds?: {
        ne: Position;
        sw: Position;
    };
};
export interface CameraProps extends CameraStop, CameraFollowConfig, CameraMinMaxConfig {
    /** The configuration that the camera falls back on, if no other values are specified. */
    defaultSettings?: CameraStop;
    /** Whether the camera should send any configuration to the native module. Prevents unnecessary tile
     * fetching and improves performance when the map is not visible. Defaults to `true`. */
    allowUpdates?: boolean;
    /** Any arbitrary primitive value that, when changed, causes the camera to retry moving to its target
     * configuration. (Not yet implemented.) */
    triggerKey?: string | number;
    /** Executes when user tracking mode changes. */
    onUserTrackingModeChange?: UserTrackingModeChangeCallback;
}
export declare type CameraBounds = {
    ne: Position;
    sw: Position;
};
export declare type CameraPadding = {
    paddingLeft: number;
    paddingRight: number;
    paddingTop: number;
    paddingBottom: number;
};
export declare type CameraBoundsWithPadding = Partial<CameraPadding> & CameraBounds;
export declare type CameraStops = {
    /** Allows static check of the data type. For internal use only. */
    readonly type: 'CameraStops';
    stops: CameraStop[];
};
export declare type CameraAnimationMode = 'flyTo' | 'easeTo' | 'linearTo' | 'moveTo' | 'none';
/**
 * Controls the perspective from which the user sees the map.
 *
 * To use imperative methods, pass in a ref object:
 *
 * ```
 * const camera = useRef<Camera>(null);
 *
 * useEffect(() => {
 *   camera.current?.setCamera({
 *     centerCoordinate: [lon, lat],
 *   });
 * }, []);
 *
 * return (
 *   <Camera ref={camera} />
 * );
 * ```
 */
export declare const Camera: React.MemoExoticComponent<React.ForwardRefExoticComponent<CameraProps & React.RefAttributes<CameraRef>>>;
export declare type Camera = CameraRef;
//# sourceMappingURL=Camera.d.ts.map