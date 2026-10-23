import type { ParamListBase, PathConfigMap } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
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
import type { BaseExampleProps } from '../examples/common/BaseExamplePropTypes';

import MapHeader from '../examples/common/MapHeader';
import Page, { type PageProps } from '../examples/common/Page';
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
import CompilerTestExample from '../examples/CompilerTestExample';
// Cache Management
import * as CacheOffline from '../examples/CacheOffline';
// Screens driven by the Detox tests in example/e2e
import * as E2E from '../examples/E2E';
// V10
import * as V10 from '../examples/V10';
// V11
import StyleImportConfig from '../examples/V11/StyleImportConfig';
import RasterParticle from '../examples/V11/RasterParticle';
import SnowAndRain from '../examples/V11/SnowAndRain';

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

export type ItemProps = NativeStackScreenProps<ParamListBase>;

type ItemComponent = React.ComponentType<Partial<BaseExampleProps>>;

const Stack = createNativeStackNavigator();

const screenOptions = { gestureEnabled: false, headerShown: false };

class ExampleItem {
  Component: ItemComponent;
  group?: ExampleGroup;

  constructor(
    readonly label: string,
    readonly name: string,
    Component: unknown,
  ) {
    this.Component = Component as ItemComponent;
  }

  get route() {
    return this.group ? `${this.group.name}/${this.name}` : this.name;
  }
}

class ExampleGroup {
  listRoute: string;

  constructor(
    readonly label: string,
    readonly name: string,
    readonly items: ExampleItem[],
  ) {
    this.listRoute = `${name}/List`;
    items.forEach((item) => {
      item.group = this;
    });
  }
}

class MostRecentExampleItem {
  label = 'Most recent';
  item?: ExampleItem;

  updateIfNeeded(updated: () => void): void {
    (async () => {
      const route = await AsyncStorage.getItem(MostRecentExampleKey);
      const item = route ? itemsByRoute[route] : undefined;
      if (item) {
        this.label = `Most recent: ${item.label}`;
        this.item = item;
        updated();
      }
    })();
  }
}

type ExampleNode = ExampleItem | ExampleGroup | MostRecentExampleItem;

const PageWrapper = (Component: ItemComponent) => (props: BaseExampleProps) => (
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
  name: string,
) {
  return new ExampleItem(
    Component?.metadata?.title ?? name,
    name,
    Component?.metadata?.page ? Component : PageWrapper(Component),
  );
}

/**
 * @param name the directory name of the group, matching `groupName` in docs/examples.json
 */
function exampleGroup(
  name: string,
  group: { [key: `${UpercaseLetter}${string}`]: ItemComponent } & {
    metadata: { title: string };
  },
) {
  const { metadata, ...components } = group;

  return new ExampleGroup(
    metadata.title,
    name,
    Object.entries(components).map(([key, value]) => example(value, key)),
  );
}

const BugReportPage =
  (Klass: React.ComponentType<PageProps>) =>
  ({ ...props }: PageProps) => (
    <Page {...props}>
      <Klass {...props} />
    </Page>
  );

const mostRecent = new MostRecentExampleItem();

const Examples: ExampleNode[] = [
  mostRecent,
  new ExampleItem(
    'Bug Report Template',
    'BugReportExample',
    BugReportPage(BugReportExample),
  ),
  new ExampleItem(
    'Bug Report Template TS',
    'BugReportExampleTS',
    BugReportPage(BugReportExampleTS),
  ),
  new ExampleItem(
    'React Compiler Test',
    'CompilerTestExample',
    BugReportPage(CompilerTestExample),
  ),
  exampleGroup('V10', V10),
  new ExampleGroup('V11', 'V11', [
    example(StyleImportConfig, 'StyleImportConfig'),
    example(RasterParticle, 'RasterParticle'),
    example(SnowAndRain, 'SnowAndRain'),
  ]),
  exampleGroup('Map', Map),
  exampleGroup('Camera', Camera),
  exampleGroup('UserLocation', UserLocation),
  exampleGroup('SymbolCircleLayer', SymbolCircleLayer),
  exampleGroup('FillRasterLayer', FillRasterLayer),
  exampleGroup('LineLayer', LineLayer),
  exampleGroup('Annotations', Annotations),
  exampleGroup('Animations', Animations),
  exampleGroup('Web', Web),
  exampleGroup('CacheOffline', CacheOffline),
  exampleGroup('E2E', E2E),
];

const itemsByRoute: Record<string, ExampleItem> = {};
const groupsByRoute: Record<string, ExampleGroup> = {};
Examples.forEach((node) => {
  if (node instanceof ExampleGroup) {
    groupsByRoute[node.name] = node;
    groupsByRoute[node.listRoute] = node;
    node.items.forEach((item) => (itemsByRoute[item.route] = item));
  } else if (node instanceof ExampleItem) {
    itemsByRoute[node.route] = node;
  }
});

function ExampleList({
  items,
  navigation,
  showBack,
  title,
}: {
  items: ExampleNode[];
  navigation: ItemProps['navigation'];
  showBack?: boolean;
  title: string;
}) {
  function itemPress(node: ExampleNode) {
    if (node instanceof ExampleGroup) {
      navigation.push(node.name);
    } else if (node instanceof ExampleItem) {
      navigation.push(node.route);
    } else if (node.item?.group) {
      navigation.push(node.item.group.name, { screen: node.item.route });
    } else if (node.item) {
      navigation.push(node.item.route);
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
    mostRecent.updateIfNeeded(forceUpdate);
  }, [forceUpdate]);

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

const Home = ({ navigation }: ItemProps) => (
  <ExampleList
    title="React Native Mapbox"
    items={Examples}
    navigation={navigation}
  />
);

const GroupList = ({ route, navigation }: ItemProps) => {
  const { label, items } = groupsByRoute[route.name]!;
  return (
    <ExampleList title={label} items={items} navigation={navigation} showBack />
  );
};

const GroupNavigator = ({ route }: ItemProps) => {
  const { label, listRoute, items } = groupsByRoute[route.name]!;
  return (
    <Stack.Navigator initialRouteName={listRoute} screenOptions={screenOptions}>
      <Stack.Screen
        name={listRoute}
        component={GroupList}
        options={{ title: label }}
      />
      {items.map(itemScreen)}
    </Stack.Navigator>
  );
};

const ExampleScreen = ({ route, navigation }: ItemProps) => {
  const { label, Component } = itemsByRoute[route.name]!;
  const onDismissExample = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    AsyncStorage.setItem(MostRecentExampleKey, route.name);
  }, [route.name]);

  return (
    <Component
      label={label}
      onDismissExample={onDismissExample}
      navigation={navigation}
    />
  );
};

function itemScreen(item: ExampleItem) {
  return (
    <Stack.Screen
      key={item.route}
      name={item.route}
      component={ExampleScreen}
      options={{ title: item.label }}
    />
  );
}

/**
 * Screens for the root stack: the example list, one nested stack per group,
 * and the examples that aren't in a group.
 */
export function exampleScreens() {
  return [
    <Stack.Screen
      key="Home"
      name="Home"
      component={Home}
      options={{ title: 'React Native Mapbox' }}
    />,
    ...Examples.map((node) => {
      if (node instanceof ExampleGroup) {
        return (
          <Stack.Screen
            key={node.name}
            name={node.name}
            component={GroupNavigator}
            options={{ title: node.label }}
          />
        );
      }
      return node instanceof ExampleItem ? itemScreen(node) : null;
    }),
  ];
}

/**
 * Paths are `<basePath>/<groupName>/<name>`, with the names from docs/examples.json.
 * `otherScreens` are root stack screens outside the example tree.
 */
export function exampleLinkingScreens(
  basePath: string,
  otherScreens: string[],
): PathConfigMap<ParamListBase> {
  const base = basePath.replace(/^\/|\/$/g, '');
  const at = (path: string) => [base, path].filter(Boolean).join('/');
  return Object.fromEntries([
    ['Home', at('')],
    ...Examples.flatMap((node) => {
      if (node instanceof ExampleGroup) {
        const screens = Object.fromEntries([
          [node.listRoute, ''],
          ...node.items.map((item) => [item.route, item.name]),
        ]);
        return [
          [
            node.name,
            { path: at(node.name), initialRouteName: node.listRoute, screens },
          ],
        ];
      }
      return node instanceof ExampleItem ? [[node.route, at(node.route)]] : [];
    }),
    ...otherScreens.map((name) => [name, at(name)]),
  ]);
}
