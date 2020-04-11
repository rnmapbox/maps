import React from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {Icon} from 'react-native-elements';
import PropTypes from 'prop-types';

import Page from '../examples/common/Page';
import MapHeader from '../examples/common/MapHeader';
import sheet from '../styles/sheet';
import colors from '../styles/colors';
import ShowMap from '../examples/ShowMap';
import MarkerView from '../examples/MarkerView';
import SetPitch from '../examples/SetPitch';
import SetHeading from '../examples/SetHeading';
import ShowClick from '../examples/ShowClick';
import FlyTo from '../examples/FlyTo';
import FitBounds from '../examples/FitBounds';
import SetUserTrackingModes from '../examples/SetUserTrackingModes';
import SetUserLocationVerticalAlignment from '../examples/SetUserLocationVerticalAlignment';
import ShowRegionDidChange from '../examples/ShowRegionDidChange';
import CustomIcon from '../examples/CustomIcon';
import YoYo from '../examples/YoYo';
import EarthQuakes from '../examples/EarthQuakes';
import GeoJSONSource from '../examples/GeoJSONSource';
import WatercolorRasterTiles from '../examples/WatercolorRasterTiles';
import TwoByTwo from '../examples/TwoByTwo';
import IndoorBuilding from '../examples/IndoorBuilding';
import QueryAtPoint from '../examples/QueryAtPoint';
import QueryWithRect from '../examples/QueryWithRect';
import ShapeSourceIcon from '../examples/ShapeSourceIcon';
import CustomVectorSource from '../examples/CustomVectorSource';
import ShowPointAnnotation from '../examples/ShowPointAnnotation';
import AnimatedLine from '../examples/AnimatedLine';
import CreateOfflineRegion from '../examples/CreateOfflineRegion';
import DriveTheLine from '../examples/DriveTheLine';
import ImageOverlay from '../examples/ImageOverlay';
import DataDrivenCircleColors from '../examples/DataDrivenCircleColors';
import ChoroplethLayerByZoomLevel from '../examples/ChoroplethLayerByZoomLevel';
import PointInMapView from '../examples/PointInMapView';
import TakeSnapshot from '../examples/TakeSnapshot';
import TakeSnapshotWithMap from '../examples/TakeSnapshotWithMap';
import GetZoom from '../examples/GetZoom';
import GetCenter from '../examples/GetCenter';
import UserLocationChange from '../examples/UserLocationChange';
import Heatmap from '../examples/Heatmap';
import RestrictMapBounds from '../examples/RestrictMapBounds';
import ShowAndHideLayer from '../examples/ShowAndHideLayer';
import ChangeLayerColor from '../examples/ChangeLayerColor';
import SourceLayerVisibility from '../examples/SourceLayerVisibility';
import SetDisplacement from '../examples/SetDisplacement';
import CompassView from '../examples/CompassView';
import BugReportTemplate from '../examples/BugReportExample';

const styles = StyleSheet.create({
  header: {
    marginTop: 48,
    fontSize: 24,
    textAlign: 'center',
  },
  exampleList: {
    flex: 1,
  },
  exampleListItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  exampleListItem: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exampleListLabel: {
    fontSize: 18,
  },
  exampleBackground: {
    flex: 1,
    backgroundColor: colors.primary.pinkFaint,
  },
});

class ExampleItem {
  constructor(label, Component) {
    this.label = label;
    this.Component = Component;
    this.navigationType = 'Demo';
  }
}

class ExampleGroup {
  constructor(label, items) {
    this.label = label;
    this.items = items;
    this.navigationType = 'Group';
    this.Component = ({navigation}) => (
      <ExampleGroupComponent items={items} navigation={navigation} />
    );
  }
}

const BugReportPage = ({...props}) => (
  <Page {...props}>
    <BugReportTemplate />
  </Page>
);

const Examples = [
  new ExampleGroup('Map', [
    new ExampleItem('Show Map', ShowMap),
    new ExampleItem('Show Click', ShowClick),
    new ExampleItem('Show Region Did Change', ShowRegionDidChange),
    new ExampleItem('Two Map Views', TwoByTwo),
    new ExampleItem('Create Offline Region', CreateOfflineRegion),
    new ExampleItem('Get Pixel Point in MapView', PointInMapView),
    new ExampleItem('Show and hide a layer', ShowAndHideLayer),
    new ExampleItem('Change Layer Color', ChangeLayerColor),
    new ExampleItem('Source Layer Visiblity', SourceLayerVisibility),
  ]),
  new ExampleGroup('Camera', [
    new ExampleItem('Set Pitch', SetPitch),
    new ExampleItem('Set Heading', SetHeading),
    new ExampleItem('Fly To', FlyTo),
    new ExampleItem('Fit Bounds', FitBounds),
    new ExampleItem('Restrict Bounds', RestrictMapBounds),
    new ExampleItem('Set User Tracking Modes', SetUserTrackingModes),
    new ExampleItem('Yo Yo Camera', YoYo),
    new ExampleItem('Take Snapshot Without Map', TakeSnapshot),
    new ExampleItem('Take Snapshot With Map', TakeSnapshotWithMap),
    new ExampleItem('Get Current Zoom', GetZoom),
    new ExampleItem('Get Center', GetCenter),
    new ExampleItem('Compass View', CompassView),
  ]),
  new ExampleGroup('User Location', [
    new ExampleItem(
      'Set User Location Vertical Alignment',
      SetUserLocationVerticalAlignment,
    ),
    new ExampleItem('User Location Updates', UserLocationChange),
    new ExampleItem('Set Displacement', SetDisplacement),
  ]),
  new ExampleGroup('Symbol/CircleLayer', [
    new ExampleItem('Custom Icon', CustomIcon),
    new ExampleItem('Clustering Earthquakes', EarthQuakes),
    new ExampleItem('Shape Source From Icon', ShapeSourceIcon),
    new ExampleItem('Data Driven Circle Colors', DataDrivenCircleColors),
  ]),
  new ExampleGroup('Fill/RasterLayer', [
    new ExampleItem('GeoJSON Source', GeoJSONSource),
    new ExampleItem('Watercolor Raster Tiles', WatercolorRasterTiles),
    new ExampleItem('Indoor Building Map', IndoorBuilding),
    new ExampleItem('Query Feature Point', QueryAtPoint),
    new ExampleItem('Query Features Bounding Box', QueryWithRect),
    new ExampleItem('Custom Vector Source', CustomVectorSource),
    new ExampleItem('Image Overlay', ImageOverlay),
    new ExampleItem(
      'Choropleth Layer By Zoom Level',
      ChoroplethLayerByZoomLevel,
    ),
  ]),
  new ExampleGroup('Annotations', [
    new ExampleItem('Show Point Annotation', ShowPointAnnotation),
    new ExampleItem('Marker View', MarkerView),
    new ExampleItem('Heatmap', Heatmap),
  ]),
  new ExampleGroup('Animations', [
    new ExampleItem('Animated Line', AnimatedLine),
    new ExampleItem('Animation Along a Line', DriveTheLine),
    new ExampleItem('Yo Yo Camera', YoYo),
  ]),
  new ExampleItem('Bug Report Template', BugReportPage),
];

function ExampleGroupComponent({items, navigation, showBack}) {
  function itemPress(item) {
    navigation.navigate(item.navigationType, item);
  }

  function renderItem({item, index}) {
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
          console.log('GoBACK');
          navigation.goBack();
        },
      }
    : {};
  const title = showBack
    ? navigation.getParam('label')
    : 'React Native Mapbox GL';
  return (
    <View style={sheet.matchParent}>
      <MapHeader label={title} {...back} />
      <View style={sheet.matchParent}>
        <FlatList
          style={styles.exampleList}
          data={items}
          keyExtractor={item => item.label}
          renderItem={renderItem}
        />
      </View>
    </View>
  );
}

class Home extends React.Component {
  static propTypes = {
    navigation: PropTypes.shape({navigate: PropTypes.func}),
  };

  render() {
    const {navigation} = this.props;
    const items = navigation.getParam('items') || Examples;
    return (
      <ExampleGroupComponent
        items={items}
        navigation={navigation}
        showBack={!!navigation.getParam('items')}
      />
    );
  }
}

export default Home;
