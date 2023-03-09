import { Camera, type CameraPadding as _CameraPadding, type CameraAnimationMode as _CameraAnimationMode, type CameraBounds as _CameraBounds } from './components/Camera';
import { Atmosphere } from './components/Atmosphere';
import MapView, { type MapState as _MapState } from './components/MapView';
import Light from './components/Light';
import PointAnnotation from './components/PointAnnotation';
import Annotation from './components/annotations/Annotation';
import Callout from './components/Callout';
import UserLocation from './components/UserLocation';
import VectorSource from './components/VectorSource';
import { ShapeSource } from './components/ShapeSource';
import RasterSource from './components/RasterSource';
import RasterDemSource from './components/RasterDemSource';
import ImageSource from './components/ImageSource';
import Images from './components/Images';
import Image from './components/Image';
import FillLayer from './components/FillLayer';
import FillExtrusionLayer from './components/FillExtrusionLayer';
import HeatmapLayer from './components/HeatmapLayer';
import LineLayer from './components/LineLayer';
import CircleLayer from './components/CircleLayer';
import SkyLayer from './components/SkyLayer';
import { SymbolLayer } from './components/SymbolLayer';
import RasterLayer from './components/RasterLayer';
import BackgroundLayer from './components/BackgroundLayer';
import { Terrain } from './components/Terrain';
import locationManager, { type Location as _Location } from './modules/location/locationManager';
import offlineManager from './modules/offline/offlineManager';
import snapshotManager from './modules/snapshot/snapshotManager';
import MarkerView from './components/MarkerView';
import Animated from './utils/animated/Animated';
import { AnimatedCoordinatesArray, AnimatedExtractCoordinateFromArray, AnimatedPoint, AnimatedRouteCoordinatesArray, AnimatedShape } from './classes';
import Style from './components/Style';
import Logger from './utils/Logger';
import { getAnnotationsLayerID } from './utils/getAnnotationsLayerID';
import { FillLayerStyleProps, LineLayerStyleProps, SymbolLayerStyleProps, CircleLayerStyleProps, HeatmapLayerStyleProps, FillExtrusionLayerStyleProps, RasterLayerStyleProps, HillshadeLayerStyleProps, BackgroundLayerStyleProps, SkyLayerStyleProps, LightLayerStyleProps, AtmosphereLayerStyleProps, TerrainLayerStyleProps } from './utils/MapboxStyles';
declare const Mapbox: any;
declare const LineJoin: any;
declare const AnimatedMapPoint: typeof AnimatedPoint;
export { MapView, Light, PointAnnotation, Callout, UserLocation, Camera, Annotation, MarkerView, VectorSource, ShapeSource, RasterSource, RasterDemSource, ImageSource, Images, Image, FillLayer, FillExtrusionLayer, HeatmapLayer, LineLayer, CircleLayer, SkyLayer, SymbolLayer, RasterLayer, BackgroundLayer, Terrain, Atmosphere, AnimatedCoordinatesArray, AnimatedExtractCoordinateFromArray, AnimatedPoint, AnimatedMapPoint, AnimatedRouteCoordinatesArray, AnimatedShape, locationManager, offlineManager, snapshotManager, Animated, LineJoin, Logger, getAnnotationsLayerID, Style, };
export default Mapbox;
export declare enum _StyleURL {
    Street = "mapbox://styles/mapbox/streets-v11",
    Dark = "mapbox://styles/mapbox/dark-v10",
    Light = "mapbox://styles/mapbox/light-v10",
    Outdoors = "mapbox://styles/mapbox/outdoors-v11",
    Satellite = "mapbox://styles/mapbox/satellite-v9",
    SatelliteStreet = "mapbox://styles/mapbox/satellite-streets-v11",
    TrafficDay = "mapbox://styles/mapbox/navigation-preview-day-v4",
    TrafficNight = "mapbox://styles/mapbox/navigation-preview-night-v4"
}
export declare namespace Mapbox {
    type Location = _Location;
    type FillLayerStyle = FillLayerStyleProps;
    type LineLayerStyle = LineLayerStyleProps;
    type SymbolLayerStyle = SymbolLayerStyleProps;
    type CircleLayerStyle = CircleLayerStyleProps;
    type HeatmapLayerStyle = HeatmapLayerStyleProps;
    type FillExtrusionLayerStyle = FillExtrusionLayerStyleProps;
    type RasterLayerStyle = RasterLayerStyleProps;
    type HillshadeLayerStyle = HillshadeLayerStyleProps;
    type BackgroundLayerStyle = BackgroundLayerStyleProps;
    type SkyLayerStyle = SkyLayerStyleProps;
    type LightLayerStyle = LightLayerStyleProps;
    type AtmosphereLayerStyle = AtmosphereLayerStyleProps;
    type TerrainLayerStyle = TerrainLayerStyleProps;
    type CameraPadding = _CameraPadding;
    type CameraBounds = _CameraBounds;
    type CameraAnimationMode = _CameraAnimationMode;
    type MapState = _MapState;
    type StyleURL = _StyleURL;
}
export declare type Location = Mapbox.Location;
export declare type FillLayerStyle = Mapbox.FillLayerStyle;
export declare type LineLayerStyle = Mapbox.LineLayerStyle;
export declare type SymbolLayerStyle = Mapbox.SymbolLayerStyle;
export declare type CircleLayerStyle = Mapbox.CircleLayerStyle;
export declare type HeatmapLayerStyle = Mapbox.HeatmapLayerStyle;
export declare type FillExtrusionLayerStyle = Mapbox.FillExtrusionLayerStyle;
export declare type RasterLayerStyle = Mapbox.RasterLayerStyle;
export declare type HillshadeLayerStyle = Mapbox.HillshadeLayerStyle;
export declare type BackgroundLayerStyle = Mapbox.BackgroundLayerStyle;
export declare type SkyLayerStyle = Mapbox.SkyLayerStyle;
export declare type LightLayerStyle = Mapbox.LightLayerStyle;
export declare type AtmosphereLayerStyle = Mapbox.AtmosphereLayerStyle;
export declare type TerrainLayerStyle = Mapbox.TerrainLayerStyle;
export declare type CameraPadding = Mapbox.CameraPadding;
export declare type CameraBounds = Mapbox.CameraBounds;
export declare type CameraAnimationMode = Mapbox.CameraAnimationMode;
export declare type MapState = Mapbox.MapState;
export declare type StyleURL = Mapbox.StyleURL;
export declare const StyleURL: any;
//# sourceMappingURL=index.d.ts.map