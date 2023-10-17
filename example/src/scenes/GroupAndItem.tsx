import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '@rneui/base';
import React, { useState, useCallback, useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BaseExampleProps } from 'src/examples/common/BaseExamplePropTypes';

import MapHeader from '../examples/common/MapHeader';
import Page, { PageProps } from '../examples/common/Page';
import sheet from '../styles/sheet';
// ANIMATIONS
import AnimatedLine from '../examples/Animations/AnimatedLine';
import DriveTheLine from '../examples/Animations/DriveTheLine';
// ANNOTATIONS
import CustomCallout from '../examples/Annotations/CustomCallout';
import Heatmap from '../examples/Annotations/Heatmap';
import MarkerView from '../examples/Annotations/MarkerView';
import PointAnnotationAnchors from '../examples/Annotations/PointAnnotationAnchors';
import ShowPointAnnotation from '../examples/Annotations/ShowPointAnnotation';
// CAMERA
import CompassView from '../examples/Camera/CompassView';
import Fit from '../examples/Camera/Fit';
import FlyTo from '../examples/Camera/FlyTo';
import GetCenter from '../examples/Camera/GetCenter';
import GetZoom from '../examples/Camera/GetZoom';
import RestrictMapBounds from '../examples/Camera/RestrictMapBounds';
import SetHeading from '../examples/Camera/SetHeading';
import SetPitch from '../examples/Camera/SetPitch';
import SetUserTrackingModes from '../examples/Camera/SetUserTrackingModes';
import TakeSnapshot from '../examples/Camera/TakeSnapshot';
import TakeSnapshotWithMap from '../examples/Camera/TakeSnapshotWithMap';
import YoYo from '../examples/Camera/YoYo';
// FILLRASTERLAYER
import ChoroplethLayerByZoomLevel from '../examples/FillRasterLayer/ChoroplethLayerByZoomLevel';
import CustomVectorSource from '../examples/FillRasterLayer/CustomVectorSource';
import GeoJSONSource from '../examples/FillRasterLayer/GeoJSONSource';
import ImageOverlay from '../examples/FillRasterLayer/ImageOverlay';
import IndoorBuilding from '../examples/FillRasterLayer/IndoorBuilding';
import QueryAtPoint from '../examples/FillRasterLayer/QueryAtPoint';
import QueryWithRect from '../examples/FillRasterLayer/QueryWithRect';
import QuerySourceFeatures from '../examples/FillRasterLayer/QuerySourceFeatures';
import WatercolorRasterTiles from '../examples/FillRasterLayer/WatercolorRasterTiles';
// LINE LAYER
import GradientLine from '../examples/LineLayer/GradientLine';
import DrawPolyline from '../examples/LineLayer/DrawPolyline';
// MAP
import ChangeLayerColor from '../examples/Map/ChangeLayerColor';
import CreateOfflineRegion from '../examples/Map/CreateOfflineRegion';
import OfflineExample from '../examples/Map/OfflineExample';
import Ornaments from '../examples/Map/Ornaments';
import PointInMapView from '../examples/Map/PointInMapView';
import ShowAndHideLayer from '../examples/Map/ShowAndHideLayer';
import ShowClick from '../examples/Map/ShowClick';
import ShowMap from '../examples/Map/ShowMap';
import ShowMapLocalStyle from '../examples/Map/ShowMapLocalStyle';
import ShowRegionDidChange from '../examples/Map/ShowRegionDidChange';
import SourceLayerVisibility from '../examples/Map/SourceLayerVisibility';
import StyleJson from '../examples/Map/StyleJson';
import TwoByTwo from '../examples/Map/TwoByTwo';
import MapAndRNNavigation from '../examples/Map/MapAndRNNavigation';
import DynamicUrl from '../examples/Map/DynamicUrl';
import LocalizeLabels from '../examples/Map/LocalizeLabels';
// SYMBOLCIRCLELAYER
import * as SymbolCircleLayer from '../examples/SymbolCircleLayer';
// USERLOCATION
import * as UserLocation from '../examples/UserLocation';
// MISC
import BugReportExample from '../examples/BugReportExample';
import BugReportExampleTS from '../examples/BugReportExampleTS';
import CacheManagement from '../examples/CacheManagement';
// V10
import CameraAnimation from '../examples/V10/CameraAnimation';
import GlobeProjection from '../examples/V10/GlobeProjection';
import MapHandlers from '../examples/V10/MapHandlers';
import Markers from '../examples/V10/Markers';
import QueryTerrainElevation from '../examples/V10/QueryTerrainElevation';
import TerrainSkyAtmosphere from '../examples/V10/TerrainSkyAtmosphere';
// V11
import StyleImportConfig from '../examples/V11/StyleImportConfig';

const MostRecentExampleKey = '@recent_example';

//type with all uppercase letters from A-Z
type UpercaseLetter =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'X'
  | 'Y'
  | 'Z';

const styles = StyleSheet.create({
  exampleList: {
    flex: 1,
  },
  exampleListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  exampleListItemBorder: {
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  exampleListLabel: {
    fontSize: 18,
  },
});

type NavigationType = 'Group' | 'Item';

type ItemComponentProps = BaseExampleProps;

type ItemComponent = React.ComponentType<Partial<ItemComponentProps>>;

interface ExampleNode {
  label: string;
  navigationType: NavigationType;
  path: string[];

  updateIfNeeded(updated: () => void): void;
  setParent(parent: string[]): void;
  find(path: string[]): ExampleNode | undefined;
}

class MostRecentExampleItem implements ExampleNode {
  label: string;
  navigationType: NavigationType;
  path: string[];

  constructor() {
    this.label = 'Most recent';
    this.navigationType = 'Item';
    this.path = [];
  }

  setParent(parent: string[]) {
    this.path = [...parent, this.label];
  }

  find(path: string[]) {
    if (path.length === 1 && path[0] === this.label) {
      return this;
    } else {
      return undefined;
    }
  }

  updateIfNeeded(updated: () => void): void {
    (async () => {
      const pathJSON = await AsyncStorage.getItem(MostRecentExampleKey);
      if (pathJSON) {
        const path = JSON.parse(pathJSON);
        this.label = `Most recent: ${path.slice(-1)}`;
        this.path = path;
        updated();
      }
    })();
  }
}

class ExampleItem implements ExampleNode {
  label: string;
  Component: ItemComponent;
  navigationType: NavigationType;
  path: string[];

  constructor(label: string, Component: unknown) {
    this.label = label;
    this.Component = Component as ItemComponent;
    this.navigationType = 'Item';
    this.path = [label];
  }

  setParent(parent: string[]) {
    this.path = [...parent, this.label];
  }

  find(path: string[]) {
    if (path.length === 1 && path[0] === this.label) {
      return this;
    } else {
      return undefined;
    }
  }

  async getPath(): Promise<string[]> {
    return this.path;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateIfNeeded(_updated: () => void): void {}
}

type RootStackParamList = {
  Group: { path: string[] };
  Item: { path: string[] };
};

type GroupProps = NativeStackScreenProps<RootStackParamList, 'Group'>;
export type ItemProps = NativeStackScreenProps<RootStackParamList, 'Item'>;

class ExampleGroup implements ExampleNode {
  label: string;
  navigationType: NavigationType;
  path: string[];
  items: ExampleNode[];

  constructor(label: string, items: ExampleNode[]) {
    this.label = label;
    this.items = items;
    this.navigationType = 'Group';
    this.path = [label];
    this.setParent([]);
  }

  setParent(parent: string[]) {
    this.path = [...parent, this.label];
    this.items.forEach((i) => i.setParent(this.path));
  }

  find(path: string[]): ExampleNode | undefined {
    const [root, ...rest] = path;
    if (root === this.label) {
      if (rest.length > 0) {
        return this.items.reduce<ExampleNode | undefined>(
          (prev, act) => prev || act.find(rest),
          undefined,
        );
      } else {
        return this;
      }
    } else {
      return undefined;
    }
  }

  async getPath(): Promise<string[]> {
    return this.path;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateIfNeeded(_updated: () => void): void {}
}

const PageWrapper = (Component: ItemComponent) => (props: BaseExampleProps) =>
  (
    <Page
      label={props.label}
      onDismissExample={props.onDismissExample}
      navigation={props.navigation}
    >
      <Component {...props} />
    </Page>
  );

function example(
  Component: ItemComponent & {
    metadata?: {
      title?: string;
      tags?: string[];
      docs?: string;
      page?: boolean;
    };
  },
  title: string | undefined = undefined,
) {
  return new ExampleItem(
    Component?.metadata?.title ?? title ?? 'n/a',
    Component?.metadata?.page ? Component : PageWrapper(Component),
  );
}

function exampleGroup(
  group: { [key: `${UpercaseLetter}${string}`]: ItemComponent } & {
    metadata: { title: string };
  },
) {
  const { metadata, ...components } = group;

  return new ExampleGroup(
    metadata.title,
    Object.entries(components).map(([key, value]) => {
      return example(value, key);
    }),
  );
}

const BugReportPage =
  (Klass: React.ComponentType<PageProps>) =>
  ({ ...props }: PageProps) =>
    (
      <Page {...props}>
        <Klass {...props} />
      </Page>
    );

const Examples = new ExampleGroup('React Native Mapbox', [
  new MostRecentExampleItem(),
  new ExampleItem('Bug Report Template', BugReportPage(BugReportExample)),
  new ExampleItem('Bug Report Template TS', BugReportPage(BugReportExampleTS)),
  new ExampleGroup('V10', [
    new ExampleItem('Terrain, Sky, & Atmosphere', TerrainSkyAtmosphere),
    new ExampleItem('Globe Projection', GlobeProjection),
    new ExampleItem('Query Terrain Elevation', QueryTerrainElevation),
    new ExampleItem('Camera Animation', CameraAnimation),
    new ExampleItem('Map Handlers', MapHandlers),
  ]),
  new ExampleGroup('V11', [example(StyleImportConfig)]),
  new ExampleGroup('Map', [
    new ExampleItem('Show Map', ShowMap),
    new ExampleItem('Show Map With Local Style.JSON', ShowMapLocalStyle),
    new ExampleItem('Show Click', ShowClick),
    new ExampleItem('Show Region Did Change', ShowRegionDidChange),
    new ExampleItem('Two Map Views', TwoByTwo),
    new ExampleItem('Create Offline Region', CreateOfflineRegion),
    new ExampleItem('Offline example', OfflineExample),
    new ExampleItem('Localize labels', LocalizeLabels),
    new ExampleItem('Get Pixel Point in MapView', PointInMapView),
    new ExampleItem('Show and hide a layer', ShowAndHideLayer),
    new ExampleItem('Change Layer Color', ChangeLayerColor),
    new ExampleItem('Source Layer Visiblity', SourceLayerVisibility),
    new ExampleItem('Style JSON', StyleJson),
    new ExampleItem('Ornaments', Ornaments),
    new ExampleItem('Map and rn-navigation', MapAndRNNavigation),
    new ExampleItem('Dynamic Url', DynamicUrl),
  ]),
  new ExampleGroup('Camera', [
    new ExampleItem('Fit (Bounds, Center/Zoom, Padding)', Fit),
    new ExampleItem('Set Pitch', SetPitch),
    new ExampleItem('Set Heading', SetHeading),
    new ExampleItem('Fly To', FlyTo),
    new ExampleItem('Restrict Bounds', RestrictMapBounds),
    new ExampleItem('Set User Tracking Modes', SetUserTrackingModes),
    new ExampleItem('Yo Yo Camera', YoYo),
    new ExampleItem('Take Snapshot Without Map', TakeSnapshot),
    new ExampleItem('Take Snapshot With Map', TakeSnapshotWithMap),
    new ExampleItem('Get Current Zoom', GetZoom),
    new ExampleItem('Get Center', GetCenter),
    new ExampleItem('Compass View', CompassView),
  ]),
  exampleGroup(UserLocation),
  exampleGroup(SymbolCircleLayer),
  new ExampleGroup('Fill/RasterLayer', [
    new ExampleItem('GeoJSON Source', GeoJSONSource),
    new ExampleItem('Watercolor Raster Tiles', WatercolorRasterTiles),
    new ExampleItem('Indoor Building Map', IndoorBuilding),
    new ExampleItem('Query Feature Point', QueryAtPoint),
    new ExampleItem('Query Features Bounding Box', QueryWithRect),
    new ExampleItem('Query Source Features', QuerySourceFeatures),
    new ExampleItem('Custom Vector Source', CustomVectorSource),
    new ExampleItem('Image Overlay', ImageOverlay),
    new ExampleItem(
      'Choropleth Layer By Zoom Level',
      ChoroplethLayerByZoomLevel,
    ),
  ]),
  new ExampleGroup('LineLayer', [
    new ExampleItem('GradientLine', GradientLine),
    example(DrawPolyline),
  ]),
  new ExampleGroup('Annotations', [
    new ExampleItem('Marker Positions & Anchors', Markers),
    new ExampleItem('Show Point Annotation', ShowPointAnnotation),
    new ExampleItem('Point Annotation Anchors', PointAnnotationAnchors),
    new ExampleItem('Marker View', MarkerView),
    new ExampleItem('Heatmap', Heatmap),
    new ExampleItem('Custom Callout', CustomCallout),
  ]),
  new ExampleGroup('Animations', [
    new ExampleItem('Animated Line', AnimatedLine),
    new ExampleItem('Animation Along a Line', DriveTheLine),
  ]),
  new ExampleItem('Cache management', CacheManagement),
]);

function ExampleGroupComponent({
  items,
  navigation,
  showBack,
  title,
}: {
  items: ExampleNode[];
  navigation: GroupProps['navigation'];
  showBack?: boolean;
  title: string;
}) {
  async function itemPress(item: ExampleNode) {
    const { path } = item;
    if (path.length > 0) {
      navigation.push(item.navigationType, { path });
    }
  }

  function renderItem({ item }: { item: ExampleNode }) {
    return (
      <View style={styles.exampleListItemBorder}>
        <TouchableOpacity onPress={() => itemPress(item)}>
          <View style={styles.exampleListItem}>
            <Text style={styles.exampleListLabel}>{item.label}</Text>
            <Icon name="keyboard-arrow-right" />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  const back = showBack
    ? {
        onBack: () => {
          navigation.goBack();
        },
      }
    : {};

  const [, updateState] = useState<object>();
  const forceUpdate = useCallback(() => updateState({}), []);

  useEffect(() => {
    items.forEach((item) => {
      item.updateIfNeeded(forceUpdate);
    });
  }, [items, forceUpdate]);

  return (
    <View style={sheet.matchParent}>
      <MapHeader label={title} {...back} />
      <View style={sheet.matchParent}>
        <FlatList
          style={styles.exampleList}
          data={items}
          keyExtractor={(item) => item.label}
          renderItem={renderItem}
        />
      </View>
    </View>
  );
}

export const Group = ({ route, navigation }: GroupProps) => {
  const path = route?.params?.path || [Examples.label];
  const item = Examples.find(path);
  if (!(item instanceof ExampleGroup)) {
    throw Error(`error:Expected group not node! path:${path} item:${item}`);
  }
  const { items } = item;
  return (
    <ExampleGroupComponent
      items={items}
      navigation={navigation}
      showBack={path.length > 1}
      title={item.label}
    />
  );
};

export const Item = ({ route, navigation }: ItemProps) => {
  const onDismissExample = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    AsyncStorage.setItem(
      MostRecentExampleKey,
      JSON.stringify(route.params.path),
    );
  }, [route.params.path]);
  const { path } = route.params;
  const item = Examples.find(path);
  if (!(item instanceof ExampleItem)) {
    throw Error(
      `error:Expected item not group|undefined! path:${path} item:${item}`,
    );
  }
  const { label, Component } = item;

  return (
    <Component
      label={label}
      onDismissExample={onDismissExample}
      navigation={navigation}
    />
  );
};
