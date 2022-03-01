import React from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {Icon} from 'react-native-elements';
import PropTypes from 'prop-types';

import Page from '../examples/common/Page';
import MapHeader from '../examples/common/MapHeader';
import sheet from '../styles/sheet';
// ANIMATIONS
import AnimatedLine from '../examples/Animations/AnimatedLine';
import DriveTheLine from '../examples/Animations/DriveTheLine';
// ANNOTATIONS
import CustomCallout from '../examples/Annotations/CustomCallout';
import Heatmap from '../examples/Annotations/Heatmap';
import MarkerView from '../examples/Annotations/MarkerView';
import ShowPointAnnotation from '../examples/Annotations/ShowPointAnnotation';
import PointAnnotationAnchors from '../examples/Annotations/PointAnnotationAnchors';
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
import WatercolorRasterTiles from '../examples/FillRasterLayer/WatercolorRasterTiles';
// LINE LAYER
import GradientLine from '../examples/LineLayer/GradientLine';
// MAP
import ChangeLayerColor from '../examples/Map/ChangeLayerColor';
import CreateOfflineRegion from '../examples/Map/CreateOfflineRegion';
import PointInMapView from '../examples/Map/PointInMapView';
import ShowAndHideLayer from '../examples/Map/ShowAndHideLayer';
import ShowClick from '../examples/Map/ShowClick';
import ShowMap from '../examples/Map/ShowMap';
import ShowMapLocalStyle from '../examples/Map/ShowMapLocalStyle';
import ShowRegionDidChange from '../examples/Map/ShowRegionDidChange';
import SourceLayerVisibility from '../examples/Map/SourceLayerVisibility';
import StyleJson from '../examples/Map/StyleJson';
import TwoByTwo from '../examples/Map/TwoByTwo';
// SYMBOLCIRCLELAYER
import CustomIcon from '../examples/SymbolCircleLayer/CustomIcon';
import DataDrivenCircleColors from '../examples/SymbolCircleLayer/DataDrivenCircleColors';
import EarthQuakes from '../examples/SymbolCircleLayer/EarthQuakes';
import ShapeSourceIcon from '../examples/SymbolCircleLayer/ShapeSourceIcon';
// USERLOCATION
import SetDisplacement from '../examples/UserLocation/SetDisplacement';
import SetTintColor from '../examples/UserLocation/SetTintColor';
import SetUserLocationRenderMode from '../examples/UserLocation/SetUserLocationRenderMode';
import SetUserLocationVerticalAlignment from '../examples/UserLocation/SetUserLocationVerticalAlignment';
import UserLocationChange from '../examples/UserLocation/UserLocationChange';
// MISC
import BugReportTemplate from '../examples/BugReportExample';
import CacheManagement from '../examples/CacheManagement';
// V10
import SkyAndTerran from '../examples/V10/SkyAndTerran';
import QueryTerrainElevation from '../examples/V10/QueryTerrainElevation';

const styles = StyleSheet.create({
  exampleList: {
    flex: 1,
  },
  exampleListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  exampleListItemBorder: {
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  exampleListLabel: {
    fontSize: 18,
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
    // eslint-disable-next-line react/prop-types
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
  new ExampleItem('Bug Report Template', BugReportPage),
  new ExampleGroup('V10', [
    new ExampleItem('Sky and Terrain', SkyAndTerran),
    new ExampleItem('Query Terrain Elevation', QueryTerrainElevation),
  ]),
  new ExampleGroup('Map', [
    new ExampleItem('Show Map', ShowMap),
    new ExampleItem('Show Map With Local Style.JSON', ShowMapLocalStyle),
    new ExampleItem('Show Click', ShowClick),
    new ExampleItem('Show Region Did Change', ShowRegionDidChange),
    new ExampleItem('Two Map Views', TwoByTwo),
    new ExampleItem('Create Offline Region', CreateOfflineRegion),
    new ExampleItem('Get Pixel Point in MapView', PointInMapView),
    new ExampleItem('Show and hide a layer', ShowAndHideLayer),
    new ExampleItem('Change Layer Color', ChangeLayerColor),
    new ExampleItem('Source Layer Visiblity', SourceLayerVisibility),
    new ExampleItem('Style JSON', StyleJson),
    new ExampleItem('Set Tint Color', SetTintColor),
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
  new ExampleGroup('User Location', [
    new ExampleItem(
      'Set User Location Vertical Alignment',
      SetUserLocationVerticalAlignment,
    ),
    new ExampleItem('User Location Updates', UserLocationChange),
    new ExampleItem('Set Displacement', SetDisplacement),
    new ExampleItem('Set User Location Render Mode', SetUserLocationRenderMode),
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
  new ExampleGroup('LineLayer', [
    new ExampleItem('GradientLine', GradientLine),
  ]),
  new ExampleGroup('Annotations', [
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
];

function ExampleGroupComponent({items, navigation, showBack}) {
  function itemPress(item) {
    navigation.navigate(item.navigationType, item);
  }

  function renderItem({item}) {
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
ExampleGroupComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    getParam: PropTypes.func,
    goBack: PropTypes.func,
  }),
  showBack: PropTypes.bool,
  items: PropTypes.any,
};

class Home extends React.Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
      getParam: PropTypes.func,
    }),
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
