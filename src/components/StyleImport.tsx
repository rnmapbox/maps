import { memo } from 'react';

import NativeStyleImport from '../specs/RNMBXStyleImportNativeComponent';

/**
 * Configuration options for the Mapbox Standard style.
 *
 * These options are available when using `StyleImport` with `id="basemap"` and
 * a Standard style URL (e.g., `mapbox://styles/mapbox/standard`).
 */
export type StandardStyleConfig = {
  /** Light preset: controls time-of-day lighting */
  lightPreset?: 'dawn' | 'day' | 'dusk' | 'night';
  /** Color theme */
  theme?: 'default' | 'faded' | 'monochrome';
  /** Font family for labels (e.g., 'Montserrat') */
  font?: string;
  /** Show generic 3D objects */
  show3dObjects?: boolean;
  /** Show extruded 3D buildings */
  show3dBuildings?: boolean;
  /** Show 3D building facades (v11.16+) */
  show3dFacades?: boolean;
  /** Show 3D landmarks (v11.16+) */
  show3dLandmarks?: boolean;
  /** Show 3D trees (v11.17+) */
  show3dTrees?: boolean;
  /** Show point of interest labels */
  showPointOfInterestLabels?: boolean;
  /** Show transit labels */
  showTransitLabels?: boolean;
  /** Show place labels */
  showPlaceLabels?: boolean;
  /** Show road labels */
  showRoadLabels?: boolean;
  /** Show pedestrian roads */
  showPedestrianRoads?: boolean;
  /** Color override for buildings (v11.18+) */
  colorBuildings?: string;
  /** Color override for commercial areas (v11.18+) */
  colorCommercial?: string;
  /** Color override for education areas (v11.18+) */
  colorEducation?: string;
  /** Color override for industrial areas (v11.18+) */
  colorIndustrial?: string;
  /** Color override for land (v11.18+) */
  colorLand?: string;
  /** Color override for medical areas (v11.18+) */
  colorMedical?: string;
  /** Color override for roads (v11.18+) */
  colorRoads?: string;
  /** Color override for motorways (v11.18+) */
  colorMotorways?: string;
  /** Color override for water (v11.18+) */
  colorWater?: string;
  /** Color override for greenspaces (v11.18+) */
  colorGreenspaces?: string;
  /** Color override for boundaries (v11.18+) */
  colorBoundaries?: string;
};

type StyleImportConfig = StandardStyleConfig & {
  [key: string]: string | boolean | undefined;
};

type Props = {
  /**
   * id of the style import (eg. basemap)
   */
  id: string;

  /**
   * existing is now always required as true
   */
  existing: boolean;

  /**
   * config is a dictionary of configuration options for the style import.
   *
   * When using the Mapbox Standard style with `id="basemap"`, use {@link StandardStyleConfig}
   * keys for autocomplete. Arbitrary keys are also accepted for forward compatibility.
   *
   * See https://github.com/mapbox/mapbox-maps-ios/blob/main/Sources/MapboxMaps/Documentation.docc/Migrate%20to%20v11.md#21-the-mapbox-standard-style
   */
  config: StyleImportConfig;
};

/**
 * Use StyleImport to set configuration options on the new standard style. **V11 only.**
 *
 * See https://github.com/mapbox/mapbox-maps-ios/blob/main/Sources/MapboxMaps/Documentation.docc/Migrate%20to%20v11.md#21-the-mapbox-standard-style
 */
export default memo((props: Props) => {
  return (
    <NativeStyleImport
      {...props}
      config={props.config as unknown as { [key: string]: string }}
    />
  );
});
