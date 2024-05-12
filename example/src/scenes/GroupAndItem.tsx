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
import * as Animations from '../examples/Animations';
// ANNOTATIONS
import * as Annotations from '../examples/Annotations';
// CAMERA
import * as Camera from '../examples/Camera';
// FILLRASTERLAYER
import * as FillRasterLayer from '../examples/FillRasterLayer';
// LINE LAYER
import * as LineLayer from '../examples/LineLayer';
// MAP
import * as Map from '../examples/Map';
// SYMBOLCIRCLELAYER
import * as SymbolCircleLayer from '../examples/SymbolCircleLayer';
// USERLOCATION
import * as UserLocation from '../examples/UserLocation';
// WEB
import * as Web from '../examples/Web';
// MISC
import BugReportExample from '../examples/BugReportExample';
import BugReportExampleTS from '../examples/BugReportExampleTS';
import CacheManagement from '../examples/CacheManagement';
// V10
import * as V10 from '../examples/V10';
/*
import CameraAnimation from '../examples/V10/CameraAnimation';
import GlobeProjection from '../examples/V10/GlobeProjection';
import MapHandlers from '../examples/V10/MapHandlers';
import Markers from '../examples/V10/Markers';
import QueryTerrainElevation from '../examples/V10/QueryTerrainElevation';
import TerrainSkyAtmosphere from '../examples/V10/TerrainSkyAtmosphere';
*/
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
  exampleGroup(V10),
  new ExampleGroup('V11', [example(StyleImportConfig)]),
  exampleGroup(Map),
  exampleGroup(Camera),
  exampleGroup(UserLocation),
  exampleGroup(SymbolCircleLayer),
  exampleGroup(FillRasterLayer),
  exampleGroup(LineLayer),
  exampleGroup(Annotations),
  exampleGroup(Animations),
  exampleGroup(Web),
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
          testID="example-list"
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
