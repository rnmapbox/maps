import React from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {Icon} from 'react-native-elements';
import PropTypes from 'prop-types';

import MapHeader from '../examples/common/MapHeader';
import sheet from '../styles/sheet';
import colors from '../styles/colors';
import ShowMap from '../examples/ShowMap';
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
  }
}

const Examples = [
  new ExampleItem('Show Map', ShowMap),
  new ExampleItem('Set Pitch', SetPitch),
  new ExampleItem('Set Heading', SetHeading),
  new ExampleItem('Show Click', ShowClick),
  new ExampleItem('Fly To', FlyTo),
  new ExampleItem('Fit Bounds', FitBounds),
  new ExampleItem('Set User Tracking Modes', SetUserTrackingModes),
  new ExampleItem(
    'Set User Location Vertical Alignment',
    SetUserLocationVerticalAlignment,
  ),
  new ExampleItem('Show Region Did Change', ShowRegionDidChange),
  new ExampleItem('Custom Icon', CustomIcon),
  new ExampleItem('Yo Yo Camera', YoYo),
  new ExampleItem('Clustering Earthquakes', EarthQuakes),
  new ExampleItem('GeoJSON Source', GeoJSONSource),
  new ExampleItem('Watercolor Raster Tiles', WatercolorRasterTiles),
  new ExampleItem('Two Map Views', TwoByTwo),
  new ExampleItem('Indoor Building Map', IndoorBuilding),
  new ExampleItem('Query Feature Point', QueryAtPoint),
  new ExampleItem('Query Features Bounding Box', QueryWithRect),
  new ExampleItem('Shape Source From Icon', ShapeSourceIcon),
  new ExampleItem('Custom Vector Source', CustomVectorSource),
  new ExampleItem('Show Point Annotation', ShowPointAnnotation),
  new ExampleItem('Create Offline Region', CreateOfflineRegion),
  new ExampleItem('Animation Along a Line', DriveTheLine),
  new ExampleItem('Image Overlay', ImageOverlay),
  new ExampleItem('Data Driven Circle Colors', DataDrivenCircleColors),
  new ExampleItem('Choropleth Layer By Zoom Level', ChoroplethLayerByZoomLevel),
  new ExampleItem('Get Pixel Point in MapView', PointInMapView),
  new ExampleItem('Take Snapshot Without Map', TakeSnapshot),
  new ExampleItem('Take Snapshot With Map', TakeSnapshotWithMap),
  new ExampleItem('Get Current Zoom', GetZoom),
  new ExampleItem('Get Center', GetCenter),
  new ExampleItem('User Location Updates', UserLocationChange),
  new ExampleItem('Heatmap', Heatmap),
];

class Home extends React.Component {
  static propTypes = {
    navigation: PropTypes.shape({navigate: PropTypes.func}),
  };

  constructor(props) {
    super(props);
    this.renderItem = this.renderItem.bind(this);
  }

  onExamplePress(activeExamplePosition) {
    this.props.navigation.navigate('Demo', Examples[activeExamplePosition]);
  }

  renderItem({item, index}) {
    return (
      <View style={styles.exampleListItemBorder}>
        <TouchableOpacity onPress={() => this.onExamplePress(index)}>
          <View style={styles.exampleListItem}>
            <Text style={styles.exampleListLabel}>{item.label}</Text>
            <Icon name="keyboard-arrow-right" />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <View style={sheet.matchParent}>
        <MapHeader label="React Native Mapbox GL" />

        <View style={sheet.matchParent}>
          <FlatList
            style={styles.exampleList}
            data={Examples}
            keyExtractor={item => item.label}
            renderItem={this.renderItem}
          />
        </View>
      </View>
    );
  }
}

export default Home;
