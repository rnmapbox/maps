declare module 'mapbox__react-native-mapbox-gl';

import {
    Component
} from 'react';

import {
    ViewProperties,
    ViewStyle,
} from 'react-native';

type Anchor = 'center' | 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type Visibility = 'visible' | 'none'
type Alignment = 'map' | 'viewport';
type AutoAlignment = Alignment | 'auto';

type NamedStyles<T> = {
    [P in keyof T]: SymbolLayerStyle | RasterLayerStyle | LineLayerStyle | FillLayerStyle |
    FillExtrusionLayerStyle | CircleLayerStyle | BackgroundLayerStyle
};

declare namespace MapboxGL {
    function removeCustomHeader(headerName: string): void;
    function addCustomHeader(headerName: string, headerValue: string): void;
    function setAccessToken(accessToken: string): void;
    function getAccessToken(): Promise<void>;
    function setTelemetryEnabled(telemetryEnabled: boolean): void;
    function requestAndroidLocationPermissions(): Promise<boolean>;

    /**
     * Components
     */
    class MapView extends Component<MapViewProps> {
        getPointInView(coordinate: Array<number>): Promise<void>;
        getCoordinateFromView(point: Array<number>): Promise<void>;
        getVisibleBounds(): Promise<void>;
        queryRenderedFeaturesAtPoint(coordinate: Array<number>, filter?: Array<string>, layerIds?: Array<string>): Promise<void>;
        queryRenderedFeaturesInRect(coordinate: Array<number>, filter?: Array<string>, layerIds?: Array<string>): Promise<void>;
        takeSnap(writeToDisk?: boolean): Promise<string>;
        getZoom(): Promise<number>;
        getCenter(): Promise<Array<number>>;
        showAttribution(): void
    }

    class Camera extends Component<CameraProps> {
        fitBounds(
            northEastCoordinates: Array<number>,
            southWestCoordinates: Array<number>,
            padding?: number,
            duration?: number
        ): void
        flyTo(coordinates: Array<number>, duration?: number): void
        moveTo(coordinates: Array<number>, duration?: number): void;
        zoomTo(zoomLevel: number, duration?: number): void;
        setCamera(config?: any): void
    }

    class UserLocation extends Component<UserLocationProps> { }

    interface Location {
        coords: Coordinates;
        timestamp?: number;
    }

    interface Coordinates {
        heading?: number;
        speed?: number;
        latitude: number;
        longitude: number;
        accuracy?: number;
        altitude?: number;
    }

    class Light extends Component<LightProps> { }

    class StyleSheet extends Component {
        static create<T extends NamedStyles<T> | NamedStyles<any>>(styles: T): void;
        camera(stops: { [key: number]: string }, interpolationMode?: InterpolationMode): void;
        source(stops: { [key: number]: string }, attributeName: string, interpolationMode?: InterpolationMode): void;
        composite(stops: { [key: number]: string }, attributeName: string, interpolationMode?: InterpolationMode): void;

        identity(attributeName: string): number;
    }

    class PointAnnotation extends Component<PointAnnotationProps> { }
    class Callout extends Component<CalloutProps> { }

    /**
     * Sources
     */
    class VectorSource extends Component<VectorSourceProps> { }
    class ShapeSource extends Component<ShapeSourceProps> { }
    class RasterSource extends Component<RasterSourceProps> { }

    /**
     * Layers
     */
    class BackgroundLayer extends Component<BackgroundLayerProps> { }
    class CircleLayer extends Component<CircleLayerProps> { }
    class FillExtrusionLayer extends Component<FillExtrusionLayerProps> { }
    class FillLayer extends Component<FillLayerProps> { }
    class LineLayer extends Component<LineLayerProps> { }
    class RasterLayer extends Component<RasterLayerProps> { }
    class SymbolLayer extends Component<SymbolLayerProps> { }
    class HeatmapLayer extends Component<HeatmapLayerProps> { }
    class Images extends Component<ImagesProps> { }
    class ImageSource extends Component<ImageSourceProps> { }

    /**
     * Offline
     */
    class offlineManager extends Component {
        createPack(options: OfflineCreatePackOptions, progressListener?: () => void, errorListener?: () => void): void;
        deletePack(name: string): Promise<void>;
        getPacks(): Promise<void>;
        getPack(name: string): Promise<void>;
        setTileCountLimit(limit: number): void;
        setProgressEventThrottle(throttleValue: number): void;
        subscribe(packName: string, progressListener: () => void, errorListener: () => void): void;
        unsubscribe(packName: string): void;
    }

    class snapshotManager extends Component {
        takeSnap(options: SnapshotOptions): Promise<void>;
    }

    /**
     * Constants
     */
    enum UserTrackingModes {
        None = 0,
        Follow = 1,
        FollowWithCourse = 2,
        FollowWithHeading = 3,
    }

    enum InterpolationMode {
        Exponential = 0,
        Categorical = 1,
        Interval = 2,
        Identity = 3,
    }

    enum StyleURL {
        Street = 'mapbox://styles/mapbox/streets-v11',
        Dark = 'mapbox://styles/mapbox/dark-v10',
        Light = 'mapbox://styles/mapbox/light-v10',
        Outdoors = 'mapbox://styles/mapbox/outdoors-v11',
        Satellite = 'mapbox://styles/mapbox/satellite-v9',
        SatelliteStreet = 'mapbox://styles/mapbox/satellite-streets-v11',
        TrafficDay = 'mapbox://styles/mapbox/navigation-preview-day-v4',
        TrafficNight = 'mapbox://styles/mapbox/navigation-preview-night-v4'
    }

    enum StyleSource {
        DefaultSourceID = 0
    }
}

export type AttributionPosition =
  { top: number; left: number;} |
  { top: number; right: number;} |
  { bottom: number; left: number;} |
  { bottom: number; right: number;};

export interface MapViewProps extends ViewProperties {
    animated?: boolean;
    userTrackingMode?: number;
    userLocationVerticalAlignment?: number;
    contentInset?: Array<number>;
    style?: any;
    styleURL?: string;
    localizeLabels?: boolean;
    zoomEnabled?: boolean;
    scrollEnabled?: boolean;
    pitchEnabled?: boolean;
    rotateEnabled?: boolean;
    attributionEnabled?: boolean;
    attributionPosition?: AttributionPosition;
    logoEnabled?: boolean;
    compassEnabled?: boolean;
    compassViewPosition?: number;
    compassViewMargins?: object;
    surfaceView?: boolean;
    regionWillChangeDebounceTime?: number;
    regionDidChangeDebounceTime?: number;

    onPress?: () => void;
    onLongPress?: () => void;
    onRegionWillChange?: () => void;
    onRegionIsChanging?: () => void;
    onRegionDidChange?: () => void;
    onUserLocationUpdate?: () => void;
    onWillStartLoadingMap?: () => void;
    onDidFinishLoadingMap?: () => void;
    onDidFailLoadingMap?: () => void;
    onWillStartRenderingFrame?: () => void;
    onDidFinishRenderingFrame?: () => void;
    onDidFinishRenderingFrameFully?: () => void;
    onWillStartRenderingMap?: () => void;
    onDidFinishRenderingMap?: () => void;
    onDidFinishRenderingMapFully?: () => void;
    onDidFinishLoadingStyle?: () => void;
    onUserTrackingModeChange?: () => void;
}

export interface CameraProps extends CameraSettings, ViewProperties {
    animationDuration?: number;
    animationMode?: "flyTo" | "easeTo" | "moveTo";
    defaultSettings?: CameraSettings;
    minZoomLevel?: number;
    maxZoomLevel?: number;
    followUserLocation?: boolean;
    followUserMode?: "normal" | "compass" | "course";
    followZoomLevel?: number;
    followPitch?: number;
    followHeading?: number;
    triggerKey?: any;
    alignment?: number[];
    onUserTrackingModeChange?: (...args: any[]) => any;
}

export interface CameraSettings {
    centerCoordinate?: number[];
    heading?: number;
    pitch?: number;
    bounds?: {
        ne: number[];
        sw: number[];
        paddingLeft?: number;
        paddingRight?: number;
        paddingTop?: number;
        paddingBottom?: number;
    };
    zoomLevel?: number;
}


export interface UserLocationProps {
    animated?: boolean;
    renderMode?: "normal" | "custom";
    visible?: boolean;
    onPress?: (...args: any[]) => any;
    onUpdate?: (location: MapboxGL.Location) => void;
    children?: any;
}

export interface LightStyle {
    anchor?: Alignment;
    position?: Array<number>;
    positionTransition?: Transition;
    color?: string;
    colorTransition?: Transition;
    intensity?: number;
    intensityTransition?: Transition;
}

export interface Transition {
    duration: number;
    delay: number;
}

export interface BackgroundLayerStyle {
    visibilvisibility?: Visibility; ity?: Visibility;
    backgroundColor?: string;
    backgroundColorTransition?: Transition;
    backgroundPattern?: string;
    backgroundPatternTransition?: Transition;
    backgroundOpacity?: number;
    backgroundOpacityTransition?: Transition;
}

export interface CircleLayerStyle {
    visibility?: Visibility;
    circleRadius?: number;
    circleRadiusTransition?: Transition;
    circleColor?: string;
    circleColorTransition?: Transition;
    circleBlur?: number;
    circleBlurTransition?: Transition;
    circleOpacity?: number;
    circleOpacityTransition?: Transition;
    circleTranslate?: Array<number>;
    circleTranslateTransition?: Transition;
    circleTranslateAnchor?: Alignment;
    circlePitchScale?: Alignment;
    circlePitchAlignment?: Alignment;
    circleStrokeWidth?: number;
    circleStrokeWidthTransition?: Transition;
    circleStrokeColor?: string;
    circleStrokeColorTransition?: Transition;
    circleStrokeOpacity?: number;
    circleStrokeOpacityTransition?: Transition;
}

export interface FillExtrusionLayerStyle {
    visibility?: Visibility;
    fillExtrusionOpacity?: number;
    fillExtrusionOpacityTransition?: Transition;
    fillExtrusionColor?: string;
    fillExtrusionColorTransition?: Transition;
    fillExtrusionTranslate?: Array<number>;
    fillExtrusionTranslateTransition?: Transition;
    fillExtrusionTranslateAnchor?: Alignment;
    fillExtrusionPattern?: string;
    fillExtrusionPatternTransition?: Transition;
    fillExtrusionHeight?: number;
    fillExtrusionHeightTransition?: Transition;
    fillExtrusionBase?: number;
    fillExtrusionBaseTransition?: Transition;
}

export interface FillLayerStyle {
    visibility?: Visibility;
    fillAntialias?: boolean;
    fillOpacity?: number;
    fillExtrusionOpacityTransition?: Transition;
    fillColor?: string;
    fillColorTransition?: Transition;
    fillOutlineColor?: string;
    fillOutlineColorTransition?: Transition;
    fillTranslate?: Array<number>;
    fillTranslateTransition?: Transition;
    fillTranslateAnchor?: Alignment;
    fillPattern?: string;
    fillPatternTransition?: Transition;
}

export interface LineLayerStyle {
    lineCap?: 'butt' | 'round' | 'square';
    lineJoin?: 'bevel' | 'round' | 'miter';
    lineMiterLimit?: number;
    lineRoundLimit?: number;
    visibility?: Visibility;
    lineOpacity?: number;
    lineOpacityTransition?: Transition;
    lineColor?: string;
    lineColorTransition?: Transition;
    lineTranslate?: Array<number>;
    lineTranslateTransition?: Transition;
    lineTranslateAnchor?: Alignment;
    lineWidth?: number;
    lineWidthTransition?: Transition;
    lineGapWidth?: number;
    lineGapWidthTransition?: Transition;
    lineOffset?: number;
    lineOffsetTransition?: Transition;
    lineBlur?: number;
    lineBlurTransition?: Transition;
    lineDasharray?: Array<number>;
    lineDasharrayTransition?: Transition;
    linePattern?: string;
    linePatternTransition?: Transition;
}

export interface RasterLayerStyle {
    visibility?: Visibility;
    rasterOpacity?: number;
    rasterOpacityTransition?: Transition;
    rasterHueRotate?: number;
    rasterHueRotateTransition?: Transition;
    rasterBrightnessMin?: number;
    rasterBrightnessMinTransition?: Transition;
    rasterBrightnessMax?: number;
    rasterBrightnessMaxTransition?: Transition;
    rasterSaturation?: number;
    rasterSaturationTransition?: Transition;
    rasterContrast?: number;
    rasterContrastTransition?: Transition;
    rasterFadeDuration?: number;
}

export interface SymbolLayerStyle {
    symbolPlacement?: 'point' | 'line';
    symbolSpacing?: number;
    symbolAvoidEdges?: boolean;
    iconAllowOverlap?: boolean;
    iconIgnorePlacement?: boolean;
    iconOptional?: boolean;
    iconRotationAlignment?: AutoAlignment;
    iconSize?: number;
    iconTextFit?: 'none' | 'width' | 'height' | 'both';
    iconTextFitPadding?: Array<number>;
    iconImage?: string;
    iconRotate?: number;
    iconPadding?: number;
    iconKeepUpright?: boolean;
    iconOffset?: Array<number>
    iconAnchor?: Anchor;
    iconPitchAlignment?: AutoAlignment;
    textPitchAlignment?: AutoAlignment;
    textRotationAlignment?: AutoAlignment;
    textField?: string;
    textFont?: Array<string>;
    textSize?: number;
    textMaxWidth?: number;
    textLineHeight?: number;
    textLetterSpacing?: number;
    textJustify?: 'left' | 'center' | 'right';
    textAnchor?: Anchor;
    textMaxAngle?: number;
    textRotate?: number;
    textPadding?: number;
    textKeepUpright?: boolean;
    textTransform?: 'none' | 'uppercase' | 'lowercase';
    textOffset?: Array<number>;
    textAllowOverlap?: boolean;
    textIgnorePlacement?: boolean;
    textOptional?: boolean;
    visibility?: Visibility;
    iconOpacity?: number;
    iconOpacityTransition?: Transition;
    iconColor?: string;
    iconColorTransition?: Transition;
    iconHaloColor?: string;
    iconHaloColorTransition?: Transition;
    iconHaloWidth?: number;
    iconHaloWidthTransition?: Transition;
    iconHaloBlur?: number;
    iconHaloBlurTransition?: Transition;
    iconTranslate?: Array<number>
    iconTranslateTransition?: Transition;
    iconTranslateAnchor?: Alignment;
    textOpacity?: number;
    textOpacityTransition?: Transition;
    textColor?: string;
    textColorTransition?: Transition;
    textHaloColor?: string;
    textHaloColorTransition?: Transition;
    textHaloWidth?: number;
    textHaloWidthTransition?: Transition;
    textHaloBlur?: number;
    textHaloBlurTransition?: Transition;
    textTranslate?: Array<number>;
    textTranslateTransition?: Transition;
    textTranslateAnchor?: Alignment;
}

export interface HeatmapLayerStyle {
    visibility?: Visibility;
    heatmapRadius?: number;
    heatmapRadiusTransition?: Transition;
    heatmapWeight?: number;
    heatmapIntensity?: number;
    heatmapIntensityTransition?: Transition;
    heatmapColor?: string;
    heatmapOpacity?: number;
    heatmapOpacityTransition?: Transition;
}

export interface Point {
    x: number;
    y: number;
}

export interface LightProps extends ViewProps {
    style?: LightStyle;
}

export interface PointAnnotationProps {
    id: string;
    title?: string;
    snippet?: string;
    selected?: boolean;
    coordinate: Array<number>;
    anchor?: Point;
    onSelected?: () => void;
    onDeselected?: () => void;
}

export interface CalloutProps extends ViewProps {
    title?: string;
    style?: any;
    containerStyle?: any;
    contentStyle?: any;
    tipStyle?: any;
    textStyle?: any;

}

export interface TileSourceProps extends ViewProps {
    id?: string;
    url?: string;
    tileUrlTemplates?: Array<string>;
    minZoomLevel?: number;
    maxZoomLevel?: number;
}

export interface VectorSourceProps extends TileSourceProps {
    onPress?: (...args: any[]) => any;
    hitbox?: {
        width: number;
        height: number;
    };
}

export interface ShapeSourceProps extends ViewProps {
    id?: string;
    url?: string;
    shape?: Object;
    cluster?: boolean;
    clusterRadius?: number;
    clusterMaxZoomLevel?: number;
    maxZoomLevel?: number;
    buffer?: number;
    tolerance?: number;
    images?: Object;
    onPress?: (event: any) => void;
    hitbox?: {
        width: number;
        height: number;
    };
}

export interface RasterSourceProps extends TileSourceProps {
    tileSize?: number;
}

export interface LayerBaseProps extends ViewProps {
    id?: string;
    sourceID?: MapboxGL.StyleSource;
    sourceLayerID?: string;
    aboveLayerID?: string;
    belowLayerID?: string;
    layerIndex?: number;
    filter?: Array<string>;
    minZoomLevel?: number;
    maxZoomLevel?: number;
}

export interface BackgroundLayerProps extends LayerBaseProps {
    style?: BackgroundLayerStyle;
}

export interface CircleLayerProps extends LayerBaseProps {
    style?: CircleLayerStyle;
}

export interface FillExtrusionLayerProps extends LayerBaseProps {
    style?: FillExtrusionLayerStyle;
}

export interface FillLayerProps extends LayerBaseProps {
    style?: FillLayerStyle;
}

export interface LineLayerProps extends LayerBaseProps {
    style?: LineLayerStyle;
}

export interface RasterLayerProps extends LayerBaseProps {
    style?: RasterLayerStyle;
}

export interface SymbolLayerProps extends LayerBaseProps {
    style?: SymbolLayerStyle;
}

export interface HeatmapLayerProps extends LayerBaseProps {
    style?: HeatmapLayerStyle;
}

export interface ImagesProps extends ViewProps {
    images?: Object
}

export interface ImageSourceProps extends ViewProps {
    id?: string
    url?: number | string,
    coordinates: number[][]
}

export interface OfflineCreatePackOptions {
    name?: string;
    styleURL?: MapboxGL.StyleURL;
    bounds?: Array<number>;
    minZoom?: number;
    maxZoom?: number;
    metadata?: any;
}

export interface SnapshotOptions {
    centerCoordinate?: Array<number>;
    width?: number;
    height?: number;
    zoomLevel?: number;
    pitch?: number;
    heading?: number;
    styleURL?: MapboxGL.StyleURL;
    writeToDisk?: boolean;
}

export default MapboxGL;
