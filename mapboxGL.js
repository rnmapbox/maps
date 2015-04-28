'use strict';

var NativeMethodsMixin = require('NativeMethodsMixin');
var Platform = require('Platform');
var React = require('React');
var ReactIOSViewAttributes = require('ReactIOSViewAttributes');
var View = require('View');

var createReactIOSNativeComponentClass = require('createReactIOSNativeComponentClass');
var requireNativeComponent = require('requireNativeComponent');

var MapView = React.createClass({
  mixins: [NativeMethodsMixin],
  propTypes: {
    showsUserLocation: React.PropTypes.bool,
    rotateEnabled: React.PropTypes.bool,
    accessToken: React.PropTypes.string.isRequired,
    zoomLevel: React.PropTypes.number,
    styleURL: React.PropTypes.string,
    clipsToBounds: React.PropTypes.bool
    style: View.propTypes.style
  },

  render: function() {
    return <MapboxGLView {...this.props} />;
  }
});

var MapboxGLView = requireNativeComponent('mapboxGLView', MapView);

module.exports = MapView;
