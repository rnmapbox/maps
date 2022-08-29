import { SyntheticEvent } from 'react';
import { Animated } from 'react-native';
import { GeoJsonObject } from 'geojson';
export declare type MapboxGLEvent<T extends string, P = GeoJSON.Feature, V = Element> = SyntheticEvent<V, {
    type: T;
    payload: P;
}>;
export declare type UserTrackingMode = 'normal' | 'compass' | 'course';
export declare type UserTrackingModeChangeCallback = (event: MapboxGLEvent<'usertrackingmodechange', {
    followUserLocation: boolean;
    followUserMode: UserTrackingMode | null;
}>) => void;
export interface AnimatedPoint extends GeoJsonObject {
    readonly type: 'Point';
    coordinates: (Animated.Value | number)[];
}
export interface AnimatedLineString extends GeoJsonObject {
    readonly type: 'LineString';
    coordinates: (Animated.Value | number)[][];
}
//# sourceMappingURL=index.d.ts.map