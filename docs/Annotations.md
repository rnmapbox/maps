Comparsion of various annotations available in React native mapbox:

|*Feature*              | *SymbolLayer*      |*PointAnnotation*                     |*MarkerView*             |*CircleLayer*        |
|-----------------------|--------------------|--------------------------------------|-------------------------|---------------------|
|Can use images         | &check;            |                                      |                         |                     |
|RN Views as childern   | iOS: static        |iOS: interactive <br/> android: static|interactive              |                     |
|Interactions           | click              |iOS: full <br/> android: click & drag & callout  |full                     | click          |
|Control Z-index        | &check;            |iOS: always on top, android: n/a      |always on top            | &check;             |
|Clustering             | &check;            |                                      |                         | &check;             |
|Style with expressions | &check;            |                                      |                         | &check;             |
|iOS implementation     | [MGLStyleSymbolLayer](https://docs.mapbox.com/ios/api/maps/5.8.0/Classes/MGLSymbolStyleLayer.html)     |[MGLAnnotationView](https://docs.mapbox.com/ios/api/maps/5.8.0/Classes/MGLAnnotationView.html)                     |[MGLAnnotationView](https://docs.mapbox.com/ios/api/maps/5.8.0/Classes/MGLAnnotationView.html)       |[MGLCircleStyleLayer](https://docs.mapbox.com/ios/api/maps/5.8.0/Classes/MGLCircleStyleLayer.html)       |
|android implementation | [SymbolLayer](https://docs.mapbox.com/android/api/map-sdk/9.0.0/com/mapbox/mapboxsdk/style/layers/SymbolLayer.html)|[annotation.Symbol](https://docs.mapbox.com/android/api/plugins/annotation/0.8.0/com/mapbox/mapboxsdk/plugins/annotation/Symbol.html)|[annotation.Marker](https://docs.mapbox.com/android/api/plugins/markerview/0.4.0/com/mapbox/mapboxsdk/plugins/markerview/MarkerView.html) |[CircleLayer](https://docs.mapbox.com/android/api/map-sdk/9.0.0/com/mapbox/mapboxsdk/style/layers/CircleLayer.html)|


Related links:
* iOS [markers and annotations](https://docs.mapbox.com/ios/maps/overview/markers-and-annotations/)
* android [annotation plugin](https://docs.mapbox.com/android/plugins/overview/annotation/)
