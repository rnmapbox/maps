# v1.0.0

* Adds support for Android [#97](https://github.com/mapbox/react-native-mapbox-gl/pull/97)
* Adds support for polylines and polygons on both platforms [#95](https://github.com/mapbox/react-native-mapbox-gl/pull/95)
* The `annotations` object has change:
 * Either `point`, `polyline` or `polygon` is required.
 * Removed `latitude` and `longitude` and replaced with `coordinates`. For point this a single array. For polylines and polygons, this an array of arrays.
